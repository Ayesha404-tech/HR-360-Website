import * as imaps from 'imap-simple';
import { simpleParser, ParsedMail } from 'mailparser';
import { analyzeResume, parseResumeFile } from './ai-services';
import { cloudStorage } from './cloud-storage';
import { emailService } from './email-service';

export interface EmailConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
  tlsOptions?: {
    rejectUnauthorized: boolean;
  };
}

export interface ProcessedEmail {
  id: string;
  from: string;
  subject: string;
  date: Date;
  body: string;
  attachments: EmailAttachment[];
  processed: boolean;
  error?: string;
}

export interface EmailAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

export class EmailProcessingService {
  private config: EmailConfig;
  private isProcessing: boolean = false;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async connect(): Promise<imaps.ImapSimple> {
    try {
      const connection = await imaps.connect({
        imap: {
          user: this.config.user,
          password: this.config.password,
          host: this.config.host,
          port: this.config.port,
          tls: this.config.tls,
          tlsOptions: this.config.tlsOptions || { rejectUnauthorized: false },
          authTimeout: 3000,
        },
      });
      return connection;
    } catch (error) {
      console.error('Failed to connect to email server:', error);
      throw new Error('Email connection failed');
    }
  }

  async fetchUnseenEmails(connection: imaps.ImapSimple): Promise<ProcessedEmail[]> {
    try {
      await connection.openBox('INBOX');

      // Search for unseen emails
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      const processedEmails: ProcessedEmail[] = [];

      for (const message of messages) {
        try {
          const parsedEmail = await this.parseEmail(message);
          if (parsedEmail && this.hasResumeAttachments(parsedEmail)) {
            processedEmails.push(parsedEmail);
          }
        } catch (error) {
          console.error('Error parsing email:', error);
        }
      }

      return processedEmails;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  private async parseEmail(message: imaps.Message): Promise<ProcessedEmail | null> {
    try {
      const all = message.parts.find((part: { which: string }) => part.which === '');
      if (!all) return null;

      const parsed: ParsedMail = await simpleParser(all.body);
      const attachments: EmailAttachment[] = [];

      // Extract attachments
      if (parsed.attachments) {
        for (const attachment of parsed.attachments) {
          if (this.isResumeFile(attachment.filename || '')) {
            attachments.push({
              filename: attachment.filename || 'unknown',
              contentType: attachment.contentType || '',
              size: attachment.size || 0,
              content: attachment.content as Buffer,
            });
          }
        }
      }

      return {
        id: message.attributes.uid.toString(),
        from: parsed.from?.text || '',
        subject: parsed.subject || '',
        date: parsed.date || new Date(),
        body: parsed.text || '',
        attachments,
        processed: false,
      };
    } catch (error) {
      console.error('Error parsing email content:', error);
      return null;
    }
  }

  private hasResumeAttachments(email: ProcessedEmail): boolean {
    return email.attachments.some(att => this.isResumeFile(att.filename));
  }

  private isResumeFile(filename: string): boolean {
    const resumeExtensions = ['.pdf', '.doc', '.docx'];
    const lowerFilename = filename.toLowerCase();
    return resumeExtensions.some(ext => lowerFilename.endsWith(ext));
  }

  async processEmailBatch(emails: ProcessedEmail[]): Promise<void> {
    if (this.isProcessing) {
      console.log('Email processing already in progress');
      return;
    }

    this.isProcessing = true;

    try {
      console.log(`Processing ${emails.length} emails with CV attachments`);

      for (const email of emails) {
        try {
          await this.processSingleEmail(email);
          email.processed = true;
        } catch (error) {
          console.error(`Failed to process email ${email.id}:`, error);
          email.error = error instanceof Error ? error.message : 'Unknown error';
        }
      }

      // Send summary notification to HR
      await this.sendProcessingSummary(emails);

    } finally {
      this.isProcessing = false;
    }
  }

  private async processSingleEmail(email: ProcessedEmail): Promise<void> {
    console.log(`Processing email: ${email.subject} from ${email.from}`);

    for (const attachment of email.attachments) {
      try {
        // Create a File object from the attachment buffer
        const file = new File([new Uint8Array(attachment.content)], attachment.filename, {
          type: attachment.contentType,
        });

        // Parse resume text
        const resumeText = await parseResumeFile(file);

        // Extract candidate info from email content (basic parsing)
        const candidateInfo = this.extractCandidateInfo(email, resumeText);

        // Upload to cloud storage
        const uploadResult = await cloudStorage.uploadFile(file, 'resumes');
        if (!uploadResult.success) {
          throw new Error('Failed to upload resume: ' + uploadResult.error);
        }

        // Analyze with AI
        const analysis = await analyzeResume(resumeText, candidateInfo.position);

        // Store candidate in database (this will be handled by convex mutations)
        await this.storeCandidate({
          ...candidateInfo,
          resumeUrl: uploadResult.url,
          ...analysis,
        });

        console.log(`Successfully processed CV: ${attachment.filename}`);

      } catch (error) {
        console.error(`Failed to process attachment ${attachment.filename}:`, error);
        throw error;
      }
    }
  }

  private extractCandidateInfo(email: ProcessedEmail, resumeText: string) {
    // Basic extraction from email and resume text
    // In production, this could be enhanced with better NLP
    const lines = resumeText.split('\n').filter(line => line.trim());

    // Try to extract name from first few lines
    let firstName = 'Unknown';
    let lastName = 'Unknown';
    let emailAddress = email.from;
    let phone = '';
    let position = 'Unknown Position';

    // Simple name extraction (first non-empty line often contains name)
    for (const line of lines.slice(0, 5)) {
      const trimmed = line.trim();
      if (trimmed && trimmed.length > 2 && !trimmed.includes('@')) {
        const nameParts = trimmed.split(' ');
        if (nameParts.length >= 2) {
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ');
          break;
        }
      }
    }

    // Extract email from resume text
    const emailMatch = resumeText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      emailAddress = emailMatch[0];
    } else {
      // Try to extract from email body
      const bodyEmailMatch = email.body.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (bodyEmailMatch) {
        emailAddress = bodyEmailMatch[0];
      }
    }

    // Extract phone number
    const phoneMatch = resumeText.match(/(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
    if (phoneMatch) {
      phone = phoneMatch[0];
    } else {
      // Try to extract from email body
      const bodyPhoneMatch = email.body.match(/(\+?\d{1,3}[-.\s]?)?\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/);
      if (bodyPhoneMatch) {
        phone = bodyPhoneMatch[0];
      }
    }

    // Try to extract position from subject or body
    if (email.subject.toLowerCase().includes('application for')) {
      position = email.subject.replace(/.*application for/i, '').trim();
    } else if (email.body.toLowerCase().includes('applying for')) {
      const bodyMatch = email.body.match(/applying for\s+(.+)/i);
      if (bodyMatch) {
        position = bodyMatch[1].trim();
      }
    }

    return {
      firstName,
      lastName,
      email: emailAddress,
      phone,
      position,
    };
  }

  private async storeCandidate(candidateData: Record<string, unknown>): Promise<void> {
    // This will be implemented in convex mutations
    // For now, we'll call the convex function
    console.log('Storing candidate:', candidateData);
  }

  private async sendProcessingSummary(emails: ProcessedEmail[]): Promise<void> {
    const processed = emails.filter(e => e.processed);
    const failed = emails.filter(e => e.error);

    const summary = `
      Automatic CV Processing Summary:
      - Total emails processed: ${emails.length}
      - Successfully processed: ${processed.length}
      - Failed: ${failed.length}

      ${failed.length > 0 ? `Failed emails:\n${failed.map(e => `- ${e.subject}: ${e.error}`).join('\n')}` : ''}
    `;

    try {
      await emailService.sendEmail({
        to: 'hr@company.com', // Should be configurable
        subject: 'Automatic CV Processing Report',
        html: `<pre>${summary}</pre>`,
      });
    } catch (error) {
      console.error('Failed to send processing summary:', error);
    }
  }

  async startMonitoring(intervalMinutes: number = 5): Promise<void> {
    console.log(`Starting email monitoring every ${intervalMinutes} minutes`);

    const monitor = async () => {
      try {
        const connection = await this.connect();
        const emails = await this.fetchUnseenEmails(connection);

        if (emails.length > 0) {
          await this.processEmailBatch(emails);
        }

        connection.end();
      } catch (error) {
        console.error('Email monitoring error:', error);
      }
    };

    // Initial run
    await monitor();

    // Set up interval
    setInterval(monitor, intervalMinutes * 60 * 1000);
  }

  isCurrentlyProcessing(): boolean {
    return this.isProcessing;
  }
}

// Factory function to create email processing service
export const createEmailProcessingService = (config: EmailConfig): EmailProcessingService => {
  return new EmailProcessingService(config);
};
