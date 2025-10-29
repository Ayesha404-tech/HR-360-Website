import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: true // Only for demo - use backend in production
}) : null;

export interface ResumeAnalysis {
  skills: string[];
  experience: string;
  education: string;
  aiScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  summary: string;
}

export const analyzeResume = async (resumeText: string, jobDescription?: string): Promise<ResumeAnalysis> => {
  try {
    if (!openai) {
      // Demo mode - generate realistic analysis without OpenAI
      console.log('Demo mode: Generating AI analysis without OpenAI');
      return generateEnhancedFallbackAnalysis(resumeText, jobDescription);
    }

    const prompt = `
    Analyze this resume and provide a detailed assessment:

    RESUME TEXT:
    ${resumeText}

    ${jobDescription ? `JOB DESCRIPTION: ${jobDescription}` : ''}

    Please provide analysis in this exact JSON format:
    {
      "skills": ["skill1", "skill2", "skill3"],
      "experience": "Brief experience summary",
      "education": "Education background",
      "aiScore": 85,
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"],
      "recommendation": "Hiring recommendation",
      "summary": "Overall candidate summary"
    }

    Score should be 0-100 based on:
    - Technical skills relevance (30%)
    - Experience level (25%)
    - Education background (20%)
    - Communication skills (15%)
    - Cultural fit indicators (10%)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return analysis;
  } catch (error) {
    console.error('AI Resume Analysis Error:', error);
    // Enhanced fallback analysis for better accuracy
    return generateEnhancedFallbackAnalysis(resumeText, jobDescription);
  }
};

const systemPrompts = {
  hr: `
    You are an HR assistant for HR360. Handle employee queries related to attendance, leave approvals, payroll management, and exit process. You can also schedule interviews and manage recruitment.

    Your expertise covers:

    **LEAVE MANAGEMENT:**
    - Review and approve/reject leave requests
    - Manage leave policies and balances
    - Handle emergency leave situations
    - Generate leave reports for management

    **ATTENDANCE & TIME TRACKING:**
    - Monitor team attendance and overtime
    - Generate attendance reports
    - Handle attendance-related issues
    - Approve time-off requests

    **PAYROLL & COMPENSATION:**
    - Process payroll and salary adjustments
    - Manage benefits and deductions
    - Handle payroll queries and corrections
    - Generate payroll reports

    **PERFORMANCE MANAGEMENT:**
    - Conduct performance reviews
    - Set and track employee goals
    - Manage performance improvement plans
    - Handle promotion and salary review processes

    **RECRUITMENT & ONBOARDING:**
    - Schedule interviews and manage candidate pipeline
    - Review resumes and provide feedback
    - Coordinate onboarding for new hires
    - Manage job postings and applications

    **EMPLOYEE RELATIONS:**
    - Handle employee complaints and grievances
    - Manage disciplinary actions
    - Coordinate exit interviews and processes
    - Provide HR policy guidance

    **RESPONSE GUIDELINES:**
    - Be professional and authoritative
    - Provide specific HR procedures and policies
    - Direct to appropriate HR360 modules for actions
    - Maintain confidentiality when required
    - Offer managerial guidance and support

    Always direct users to appropriate HR360 modules for actions they need to take.
  `,
  admin: `
    You are an Admin assistant for HR360. Help with user management, role permissions, and system monitoring tasks.

    Your expertise covers:

    **USER MANAGEMENT:**
    - Create, update, and deactivate user accounts
    - Manage user roles and permissions
    - Handle password resets and access issues
    - Monitor user activity and access logs

    **SYSTEM ADMINISTRATION:**
    - Configure system settings and preferences
    - Manage database backups and maintenance
    - Monitor system performance and health
    - Handle system updates and patches

    **SECURITY & COMPLIANCE:**
    - Manage access controls and permissions
    - Monitor security logs and alerts
    - Ensure data privacy compliance
    - Handle security incidents and breaches

    **REPORTING & ANALYTICS:**
    - Generate system and user reports
    - Monitor key performance indicators
    - Analyze system usage patterns
    - Provide insights for system improvements

    **TECHNICAL SUPPORT:**
    - Troubleshoot system issues
    - Provide user training and documentation
    - Coordinate with IT support teams
    - Manage system integrations

    **RESPONSE GUIDELINES:**
    - Be technical and precise
    - Provide step-by-step system procedures
    - Reference technical documentation when needed
    - Maintain system security protocols
    - Offer efficient solutions to technical issues

    Always direct users to appropriate system modules for actions they need to take.
  `,
  employee: `
    You are an HR query assistant for employees in HR360. Help with personal HR-related questions such as leave requests, leave policies, attendance records, OPD submission, salary details, and clearance process.

    Your expertise covers:

    **LEAVE MANAGEMENT:**
    - Apply for different types of leave (vacation, sick, personal)
    - Check leave balances and history
    - Understand leave policies and procedures
    - Request leave approvals

    **ATTENDANCE & TIME TRACKING:**
    - Clock in/out procedures
    - View attendance records and reports
    - Report attendance issues
    - Track working hours and overtime

    **PAYROLL & COMPENSATION:**
    - View salary slips and breakdowns
    - Understand pay structure and deductions
    - Track payment history
    - Report payroll discrepancies

    **PERFORMANCE MANAGEMENT:**
    - View performance reviews and feedback
    - Set and track personal goals
    - Request performance discussions
    - Access development resources

    **EMPLOYEE BENEFITS:**
    - Health insurance and medical claims
    - Retirement and savings plans
    - Professional development opportunities
    - Other employee perks and benefits

    **COMPANY POLICIES:**
    - Code of conduct and workplace policies
    - Remote work and flexible hours
    - Safety and emergency procedures
    - Employee handbook access

    **RESPONSE GUIDELINES:**
    - Be friendly and supportive
    - Provide clear, actionable information
    - Reference relevant HR360 modules
    - Direct to HR for complex issues
    - Encourage self-service through the system

    Always direct users to appropriate HR360 modules for actions they need to take.
  `,
  candidate: `
    You are a recruitment assistant for HR360. Help candidates with job applications, available openings, interview schedules, and application status tracking.

    Your expertise covers:

    **JOB APPLICATIONS:**
    - Submit and track job applications
    - Upload resumes and documents
    - Update application information
    - Withdraw applications if needed

    **JOB SEARCH:**
    - Browse available job openings
    - Filter jobs by department, location, type
    - View detailed job descriptions
    - Save favorite positions

    **INTERVIEW PROCESS:**
    - Schedule and reschedule interviews
    - Prepare for different interview types
    - Receive interview feedback
    - Follow up on interview outcomes

    **APPLICATION TRACKING:**
    - Monitor application status
    - View application history
    - Receive notifications and updates
    - Understand next steps in process

    **ONBOARDING PREPARATION:**
    - Understand offer details and contracts
    - Prepare for new hire orientation
    - Complete pre-employment requirements
    - Learn about company culture

    **CANDIDATE SUPPORT:**
    - Get help with application issues
    - Understand company hiring process
    - Receive career advice and tips
    - Contact recruitment team

    **RESPONSE GUIDELINES:**
    - Be encouraging and professional
    - Provide clear application guidance
    - Reference HR360 recruitment modules
    - Keep candidates informed of progress
    - Offer helpful career advice

    Always direct users to appropriate HR360 modules for actions they need to take.
  `
};

export const chatWithAI = async (message: string, context?: string): Promise<string> => {
  try {
    if (!openai) {
      throw new Error('OpenAI API not configured');
    }

    // Extract user role from context
    const userRole = context?.match(/Role:\s*(\w+)/i)?.[1]?.toLowerCase() || 'employee';
    const systemPrompt = systemPrompts[userRole as keyof typeof systemPrompts] || systemPrompts.employee;

    const fullPrompt = `${systemPrompt}

    ${context ? `Context: ${context}` : ''}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: fullPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 600
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't process your request. Please contact HR directly.";
  } catch (error) {
    console.error('AI Chat Error:', error);
    return generateFallbackResponse(message);
  }
};

export const generatePerformanceInsights = async (performanceData: Record<string, unknown>): Promise<string> => {
  try {
    if (!openai) {
      throw new Error('OpenAI API not configured');
    }

    const prompt = `
    Analyze this employee performance data and provide insights:
    ${JSON.stringify(performanceData)}

    Provide:
    1. Key strengths
    2. Areas for improvement
    3. Specific recommendations
    4. Career development suggestions
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 400
    });

    return response.choices[0].message.content || "Performance analysis unavailable";
  } catch (error) {
    console.error('Performance Insights Error:', error);
    return "Unable to generate performance insights at this time.";
  }
};

// Fallback functions for when AI is unavailable
const extractSkillsFromText = (text: string): string[] => {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git',
    'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'Machine Learning', 'Data Analysis', 'Project Management', 'Leadership'
  ];

  return skillKeywords.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
};

const extractExperienceFromText = (text: string): string => {
  const experienceMatch = text.match(/(\d+)\s*(years?|yrs?)/i);
  if (experienceMatch) {
    return `${experienceMatch[1]} years of professional experience`;
  }
  return "Experience details not clearly specified";
};

const extractEducationFromText = (text: string): string => {
  const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Degree', 'University', 'College'];
  const foundEducation = educationKeywords.find(keyword =>
    text.toLowerCase().includes(keyword.toLowerCase())
  );

  return foundEducation ? `${foundEducation} level education identified` : "Education details not specified";
};

const calculateBasicScore = (text: string): number => {
  let score = 50; // Base score

  const skills = extractSkillsFromText(text);
  score += Math.min(skills.length * 5, 30);

  if (text.toLowerCase().includes('experience')) score += 10;
  if (text.toLowerCase().includes('project')) score += 5;
  if (text.toLowerCase().includes('leadership')) score += 5;

  return Math.min(score, 100);
};

const generateEnhancedFallbackAnalysis = (resumeText: string, jobDescription?: string): ResumeAnalysis => {
  const text = resumeText.toLowerCase();
  const skills = extractSkillsFromText(resumeText);
  const experience = extractExperienceFromText(resumeText);
  const education = extractEducationFromText(resumeText);
  let score = calculateBasicScore(resumeText);

  // Enhanced analysis based on content
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let recommendation = "";
  let summary = "";

  // Incorporate job description into analysis if provided
  if (jobDescription) {
    const jobDescLower = jobDescription.toLowerCase();
    // Adjust score based on job description relevance
    const relevantSkills = skills.filter(skill => jobDescLower.includes(skill.toLowerCase()));
    score += Math.min(relevantSkills.length * 3, 15); // Max 15 points for relevant skills

    if (relevantSkills.length > 0) {
      strengths.push("Skills align well with job description");
    } else {
      weaknesses.push("Limited alignment with job description skills");
    }

    if (jobDescLower.includes('leadership') && text.includes('leadership')) {
      strengths.push("Leadership experience relevant to job description");
    }
    if (jobDescLower.includes('project management') && text.includes('project')) {
      strengths.push("Project management experience relevant to job description");
    }
  }

  // Analyze strengths
  if (skills.length > 3) strengths.push("Strong technical skill set");
  if (text.includes('project') && text.includes('lead')) strengths.push("Project leadership experience");
  if (text.includes('team') && text.includes('manage')) strengths.push("Team management skills");
  if (text.includes('certification') || text.includes('certified')) strengths.push("Professional certifications");
  if (text.includes('award') || text.includes('recognition')) strengths.push("Performance recognition");

  // Default strengths if none found
  if (strengths.length === 0) {
    strengths = ["Technical background", "Professional experience"];
  }

  // Analyze weaknesses
  if (skills.length < 2) weaknesses.push("Limited technical skills mentioned");
  if (!text.includes('experience') || !text.includes('year')) weaknesses.push("Experience details unclear");
  if (!text.includes('education') && !text.includes('degree')) weaknesses.push("Education background not specified");
  if (!text.includes('project')) weaknesses.push("Limited project experience details");

  // Default weaknesses if none found
  if (weaknesses.length === 0) {
    weaknesses = ["Could provide more specific examples", "Additional certifications could strengthen profile"];
  }

  // Ensure score is within 0-100 range
  score = Math.max(0, Math.min(score, 100));

  // Generate recommendation based on score
  if (score >= 80) {
    recommendation = "Strong candidate - recommend immediate interview";
  } else if (score >= 60) {
    recommendation = "Good candidate - consider for interview with additional screening";
  } else {
    recommendation = "Consider for entry-level positions or with additional training";
  }

  // Generate summary
  summary = `Candidate demonstrates ${skills.length > 0 ? 'solid technical skills' : 'potential'} with ${experience !== 'Experience details not clearly specified' ? experience.toLowerCase() : 'professional background'}. ${education !== 'Education details not specified' ? `Education: ${education}` : 'Education background needs clarification'}. Overall assessment indicates ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'developing'} fit for the role.`;
  if (jobDescription) {
    summary += ` The analysis was enhanced with the provided job description.`;
  }

  return {
    skills,
    experience,
    education,
    aiScore: score,
    strengths,
    weaknesses,
    recommendation,
    summary
  };
};

export const parseResumeFile = async (file: File): Promise<string> => {
  try {
    const fileType = file.type;

    if (fileType === 'application/pdf') {
      // Parse PDF file using PDF.js
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: unknown) => {
            if (typeof item === 'object' && item !== null && 'str' in item) {
              return (item as { str: string }).str;
            }
            return '';
          })
          .join(' ');
        text += pageText + '\n';
      }

      return text;
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               fileType === 'application/msword') {
      // Parse DOCX file
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
    }
  } catch (error) {
    console.error('Error parsing resume file:', error);
    throw new Error('Failed to parse resume file. Please ensure the file is a valid PDF or DOCX document.');
  }
};

const generateFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Handle basic greetings and conversational messages
  if (lowerMessage.match(/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b/)) {
    return "Hello! 👋 I'm your HR360 AI Assistant. I'm here to help you with all your HR-related questions and guide you through our HR management system. What can I assist you with today?";
  }

  if (lowerMessage.match(/\b(how are you|how's it going|what's up)\b/)) {
    return "I'm doing great, thank you for asking! I'm here and ready to help you with any HR-related questions or tasks in HR360. How can I assist you today?";
  }

  if (lowerMessage.match(/\b(thank you|thanks|thankyou)\b/)) {
    return "You're very welcome! I'm glad I could help. If you have any other HR questions or need assistance with HR360, feel free to ask anytime.";
  }

  if (lowerMessage.match(/\b(bye|goodbye|see you|farewell)\b/)) {
    return "Goodbye! Have a great day. Remember, I'm always here in HR360 if you need any HR assistance.";
  }

  if (lowerMessage.match(/\b(help|assist|support)\b/)) {
    return "I'm here to help! I can assist you with:\n\n• Leave applications and policies\n• Attendance tracking and reports\n• Payroll and salary information\n• Performance reviews and goals\n• Company policies and benefits\n• Career development opportunities\n• Recruitment and onboarding\n\nWhat specific area would you like help with?";
  }

  // Leave-related queries
  if (lowerMessage.includes('leave') || lowerMessage.includes('vacation') || lowerMessage.includes('holiday')) {
    if (lowerMessage.includes('apply') || lowerMessage.includes('request')) {
      return "To apply for leave in HR360:\n1. Navigate to the 'Leave Management' module\n2. Click 'Apply for Leave'\n3. Select leave type (Vacation, Sick, Personal, etc.)\n4. Choose start and end dates\n5. Provide a reason for your leave\n6. Submit for manager approval\n\nYour leave balance and approval status will be tracked automatically.";
    }
    if (lowerMessage.includes('balance') || lowerMessage.includes('remaining')) {
      return "You can check your leave balance in the Leave Management section. It shows:\n• Vacation days available\n• Sick leave balance\n• Personal days\n• Used days this year\n\nContact HR if you need to carry over leave from previous years.";
    }
    return "HR360 supports various leave types: Vacation, Sick Leave, Personal Leave, Maternity/Paternity Leave. All leave requests require manager approval and are tracked in the Leave Management module.";
  }

  // Attendance-related queries
  if (lowerMessage.includes('attendance') || lowerMessage.includes('clock') || lowerMessage.includes('time')) {
    if (lowerMessage.includes('clock in') || lowerMessage.includes('clock out')) {
      return "To track your attendance:\n1. Go to the 'Attendance' module\n2. Use the 'Clock In' button when you start work\n3. Use the 'Clock Out' button when you finish\n4. Your hours are automatically calculated\n\nThe system tracks regular hours, overtime, and provides attendance reports.";
    }
    if (lowerMessage.includes('report') || lowerMessage.includes('history')) {
      return "Your attendance history is available in the Attendance module. You can view:\n• Daily clock in/out times\n• Total hours worked per day\n• Weekly/monthly summaries\n• Attendance trends and patterns\n\nManagers can access team attendance reports.";
    }
    return "The Attendance module helps you track work hours, view attendance history, and monitor your work schedule. Use the clock in/out buttons for accurate time tracking.";
  }

  // Payroll-related queries
  if (lowerMessage.includes('payroll') || lowerMessage.includes('salary') || lowerMessage.includes('pay') || lowerMessage.includes('payslip')) {
    if (lowerMessage.includes('payslip') || lowerMessage.includes('download')) {
      return "To access your payslips:\n1. Go to the 'Payroll Management' module\n2. Select the desired pay period\n3. Click 'View Details' to see salary breakdown\n4. Use 'Download PDF' to save your payslip\n\nPayslips show base salary, allowances, deductions, and net pay.";
    }
    if (lowerMessage.includes('structure') || lowerMessage.includes('breakdown')) {
      return "Your salary structure typically includes:\n• Base Salary (monthly/annual)\n• HRA (House Rent Allowance)\n• Conveyance Allowance\n• LTA (Leave Travel Allowance)\n• Medical Allowance\n• Tax deductions (TDS)\n• Provident Fund contributions\n\nCheck Payroll section for your specific breakdown.";
    }
    return "Payroll information is available in the Payroll Management module. You can view salary details, tax calculations, payslips, and payment history. Contact Finance for questions about deductions or allowances.";
  }

  // Performance-related queries
  if (lowerMessage.includes('performance') || lowerMessage.includes('review') || lowerMessage.includes('appraisal')) {
    if (lowerMessage.includes('review') || lowerMessage.includes('cycle')) {
      return "Performance reviews are conducted quarterly/annually. To view your reviews:\n1. Go to 'Performance Management' module\n2. Check your current score and trends\n3. View detailed feedback from managers\n4. See goals and achievements\n\nReviews include self-assessment, manager feedback, and development plans.";
    }
    if (lowerMessage.includes('goal') || lowerMessage.includes('kpi')) {
      return "Performance goals are set during reviews and tracked throughout the year. You can:\n• View current goals in Performance Management\n• Update progress on objectives\n• Request feedback from managers\n• Set new development goals\n\nGoals are aligned with company objectives and your role.";
    }
    return "The Performance Management module tracks your performance scores, reviews, goals, and development plans. Regular feedback helps you grow professionally and align with company expectations.";
  }

  // Benefits and policies
  if (lowerMessage.includes('benefit') || lowerMessage.includes('insurance') || lowerMessage.includes('health')) {
    return "Employee benefits in HR360 include:\n• Health Insurance (medical, dental, vision)\n• Retirement Plans (401k, pension)\n• Paid Time Off (vacation, sick leave)\n• Professional Development allowance\n• Employee Assistance Programs\n\nCheck with HR for specific coverage details and enrollment.";
  }

  if (lowerMessage.includes('policy') || lowerMessage.includes('handbook') || lowerMessage.includes('code')) {
    return "Company policies cover:\n• Code of Conduct and Ethics\n• Workplace Harassment policies\n• Diversity and Inclusion guidelines\n• Remote Work policies\n• Data Privacy and Security\n• Safety and Emergency procedures\n\nThe Employee Handbook is available through HR. Contact HR department for specific policy interpretations.";
  }

  // Career development
  if (lowerMessage.includes('career') || lowerMessage.includes('training') || lowerMessage.includes('development')) {
    return "Career development opportunities include:\n• Training programs and certifications\n• Mentorship programs\n• Internal job postings\n• Skills assessment and gap analysis\n• Leadership development programs\n\nDiscuss your career goals with your manager or HR for personalized development plans.";
  }

  // Recruitment and onboarding
  if (lowerMessage.includes('recruit') || lowerMessage.includes('hire') || lowerMessage.includes('interview')) {
    return "For recruitment queries:\n• Job openings are posted internally first\n• Apply through the Resume Screening module\n• Interviews are scheduled via Interview Scheduling\n• New hires go through orientation\n\nContact HR for current openings or application status.";
  }

  // General HR support
  if (lowerMessage.includes('hr') || lowerMessage.includes('contact') || lowerMessage.includes('help')) {
    return "For additional HR support:\n• Email: hr@hr360.com\n• Phone: Ext. 123\n• HR Portal: Access all modules from the main dashboard\n• Emergency: Contact your manager or HR directly\n\nI'm here to help with system-related questions and general guidance.";
  }

  // Handle yes/no questions
  if (lowerMessage.match(/\b(yes|yeah|yep|sure|okay|ok)\b/)) {
    return "Great! I'm here to help. What specific HR topic would you like assistance with? I can help with leave management, attendance, payroll, performance reviews, benefits, policies, and more.";
  }

  if (lowerMessage.match(/\b(no|nope|nah|not really)\b/)) {
    return "No problem at all! If you change your mind and need help with any HR-related questions or tasks in HR360, just let me know. I'm always here to assist.";
  }

  // Handle questions about the chatbot itself
  if (lowerMessage.includes('what can you do') || lowerMessage.includes('what do you do') || lowerMessage.includes('your capabilities')) {
    return "As your HR360 AI Assistant, I can help you with:\n\n• 📋 Leave applications and balance tracking\n• ⏰ Attendance tracking and reports\n• 💰 Payroll information and payslips\n• 📈 Performance reviews and goal setting\n• 🏥 Employee benefits and insurance\n• 📖 Company policies and procedures\n• 🎯 Career development and training\n• 👥 Recruitment and onboarding\n\nI provide step-by-step guidance and direct you to the right HR360 modules for your needs.";
  }

  if (lowerMessage.includes('who are you') || lowerMessage.includes('what are you')) {
    return "I'm the AI HR Assistant for HR360, your comprehensive HR management system. I'm designed to help employees, managers, and HR staff with all HR-related questions and tasks. I provide accurate information, step-by-step guidance, and can direct you to the appropriate modules in the system.";
  }

  // Default response
  return "I'm your HR360 AI Assistant, here to help with all HR-related queries! I can assist with:\n\n• Leave applications and policies\n• Attendance tracking and reports\n• Payroll and salary information\n• Performance reviews and goals\n• Company policies and benefits\n• Career development opportunities\n• Recruitment and onboarding\n\nWhat specific HR topic can I help you with today?";
};
