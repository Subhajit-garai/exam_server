import prisma from  "@repo/db/index";


export const entryCharges = async (userid:string) => {

let OS = await prisma.subject.create({
    data:{
        name:"Operating System",
        shortName: "OS",
        order: 100,
        description: "operating system subject",
        slug: "operating-system",
        category: "CS",
    }
})
 
let process_Os = await prisma.topic.create({
    data:{
        name:"Process",
        subjectId: OS.id,
        isparentTopic: true,
        order: 110,
        description: "Process in OS",
        slug: "process",
    }
})
let Introduction_to_Operating_Systems_Os = await prisma.topic.create({
    data:{
        name:"Thread",
        subjectId: OS.id,
        isparentTopic: true,
        order: 120, // 1.20 2-> parrect 2nd topic
        description: "Thread in OS",
        slug: "thread",
    }
})
let CPU_Scheduling_Os = await prisma.topic.create({
    data:{
        name:"CPU Scheduling",
        subjectId: OS.id,
        isparentTopic: true,
        order: 120, // 1.20 2-> parrect 2nd topic
        description: "Thread in OS",
        slug: "cpu_scheduling",
    }
})
let Thread_Os = await prisma.topic.create({
    data:{
        name:"Thread",
        subjectId: OS.id,
        isparentTopic: true,
        order: 120, // 1.20 2-> parrect 2nd topic
        description: "Thread in OS",
        slug: "thread",
    }
})

  
};
