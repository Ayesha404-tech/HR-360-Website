import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const analyzeResume = mutation({
  args: {
    candidateId: v.id("candidates"),
    resumeText: v.string(),
  },
  handler: async (ctx, args) => {
    // Mock AI analysis - in production, integrate with OpenAI API
    const skills = extractSkills(args.resumeText);
    const experience = extractExperience(args.resumeText);
    const education = extractEducation(args.resumeText);
    const aiScore = calculateAIScore(skills, experience, education);

    // Update candidate with AI analysis
    await ctx.db.patch(args.candidateId, {
      skills,
      experience,
      education,
      aiScore,
    });

    return {
      skills,
      experience,
      education,
      aiScore,
      strengths: generateStrengths(skills, experience),
      weaknesses: generateWeaknesses(skills, experience),
      recommendation: generateRecommendation(aiScore),
    };
  },
});

export const chatWithAI = mutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // Mock AI response - in production, integrate with OpenAI API
    const response = generateAIResponse(args.message);

    await ctx.db.insert("chatMessages", {
      userId: args.userId,
      message: args.message,
      response,
      timestamp: new Date().toISOString(),
    });

    return { response };
  },
});

export const getChatHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// Helper functions for AI processing
function extractSkills(resumeText: string): string[] {
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git',
    'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring Boot'
  ];
  
  return skillKeywords.filter(skill => 
    resumeText.toLowerCase().includes(skill.toLowerCase())
  );
}

function extractExperience(resumeText: string): string {
  const experienceMatch = resumeText.match(/(\d+)\s*(years?|yrs?)/i);
  if (experienceMatch) {
    return `${experienceMatch[1]} years of professional experience`;
  }
  return "Experience details not clearly specified";
}

function extractEducation(resumeText: string): string {
  const educationKeywords = ['Bachelor', 'Master', 'PhD', 'Degree', 'University', 'College'];
  const foundEducation = educationKeywords.find(keyword => 
    resumeText.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return foundEducation ? `${foundEducation} level education identified` : "Education details not specified";
}

function calculateAIScore(skills: string[], experience: string, education: string): number {
  let score = 50; // Base score
  
  // Skills contribution (40%)
  score += Math.min(skills.length * 5, 40);
  
  // Experience contribution (30%)
  const expMatch = experience.match(/(\d+)/);
  if (expMatch) {
    score += Math.min(parseInt(expMatch[1]) * 5, 30);
  }
  
  // Education contribution (20%)
  if (education.toLowerCase().includes('master') || education.toLowerCase().includes('phd')) {
    score += 20;
  } else if (education.toLowerCase().includes('bachelor')) {
    score += 15;
  } else if (education.toLowerCase().includes('degree')) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

function generateStrengths(skills: string[], experience: string): string[] {
  const strengths = [];
  
  if (skills.length > 5) {
    strengths.push("Strong technical skill set");
  }
  
  if (skills.includes('React') || skills.includes('Angular') || skills.includes('Vue.js')) {
    strengths.push("Modern frontend framework expertise");
  }
  
  if (skills.includes('Node.js') || skills.includes('Python') || skills.includes('Java')) {
    strengths.push("Backend development capabilities");
  }
  
  if (experience.includes('years')) {
    strengths.push("Relevant professional experience");
  }
  
  return strengths.length > 0 ? strengths : ["Basic technical foundation"];
}

function generateWeaknesses(skills: string[], experience: string): string[] {
  const weaknesses = [];
  
  if (skills.length < 3) {
    weaknesses.push("Limited technical skill diversity");
  }
  
  if (!skills.some(skill => ['AWS', 'Docker', 'Kubernetes'].includes(skill))) {
    weaknesses.push("Limited cloud/DevOps experience");
  }
  
  if (!experience.includes('years') || experience.includes('1 year')) {
    weaknesses.push("Limited professional experience");
  }
  
  return weaknesses.length > 0 ? weaknesses : ["Areas for growth in emerging technologies"];
}

function generateRecommendation(aiScore: number): string {
  if (aiScore >= 80) {
    return "Highly recommended candidate with strong technical skills and experience. Proceed to interview.";
  } else if (aiScore >= 60) {
    return "Good candidate with solid foundation. Consider for interview with focus on specific skill areas.";
  } else {
    return "Candidate may need additional training or experience. Consider for junior positions or with mentorship.";
  }
}

function generateAIResponse(message: string): string {
  const responses = {
    leave: "To apply for leave, go to Leave Management section and submit your request with dates and reason.",
    attendance: "You can view your attendance records in the Attendance section. Clock in/out times are tracked automatically.",
    payroll: "Your payroll information is available in the Payroll section. You can view salary breakdown and download payslips.",
    performance: "Performance reviews are conducted quarterly. Check the Performance section for your latest scores and feedback.",
    policy: "Company policies are available in the HR portal. Contact HR department for specific policy questions.",
    default: "I'm here to help with HR-related questions. You can ask about leave, attendance, payroll, performance, or policies."
  };
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('leave')) return responses.leave;
  if (lowerMessage.includes('attendance')) return responses.attendance;
  if (lowerMessage.includes('payroll') || lowerMessage.includes('salary')) return responses.payroll;
  if (lowerMessage.includes('performance')) return responses.performance;
  if (lowerMessage.includes('policy')) return responses.policy;
  
  return responses.default;
}