import type { RawTemplate } from './types';

export const EXAMPLE_TEMPLATE: RawTemplate = {
  title: "PMP 认证模拟练习 / PMP Exam Practice",
  description: "精选项目管理专业人士(PMP)认证考试模拟题，涵盖项目整合、范围、进度、成本等核心知识领域。",
  questions: [
    {
      type: "single",
      question: "对项目来说，“临时”的意思是：",
      options: [
        "项目的工期短",
        "每个项目都有确定的开始和结束点",
        "项目未来完成时间未定",
        "项目随时可以取消"
      ],
      answer: 1,
      explanation: "临时性是指每一个项目都有确定的开始和结束。"
    },
    {
      type: "single",
      question: "组织过程资产包括以下内容，除了：",
      options: [
        "项目收尾指南",
        "风险控制程序",
        "人事管理制度",
        "过程测量数据库"
      ],
      answer: 2,
      explanation: "人事管理制度通常被归类为事业环境因素(EEF)，而指南、程序和数据库是组织过程资产(OPA)。"
    },
    {
      type: "single",
      question: "在组织中管理项目时使用的政策、方法和模板由谁来提供?",
      options: [
        "项目出资人",
        "职能部门",
        "项目管理办公室 (PMO)",
        "项目经理"
      ],
      answer: 2
    },
    {
      type: "single",
      question: "项目的三重制约是哪些?",
      options: [
        "企业文化、动力、政治",
        "成本、进度、政治",
        "成本、质量、企业文化",
        "成本、进度、范围"
      ],
      answer: 3
    }
  ]
};