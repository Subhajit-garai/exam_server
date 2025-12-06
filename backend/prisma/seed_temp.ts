
import "dotenv/config";
import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

// Data to seed


const MLData: SeedData = {
    subject: {
        "id": "cuid_machine_learning_subject",
        "order": 10,
        "name": "Machine Learning",
        "shortName": "ML",
        "description": "Core machine learning concepts including classification, decision trees, neural networks, SVMs, Bayesian learning, clustering, and Hidden Markov Models.",
        "slug": "machine-learning",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1055/1055687.png",
        "color": "#8B5CF6",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Intermediate",
        "difficulty": 4
    }
    ,
    topics: [
        {
            "id": "topic_ml_classification",
            "name": "Classification",
            "shortName": "classification",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 1,
            "description": "Supervised learning task to assign labels to input data based on training examples.",
            "slug": "classification",
            "tags": ["classification", "supervised", "ml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ml_decision_tree",
            "name": "Decision Tree Learning",
            "shortName": "decision-tree",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 2,
            "description": "Learning algorithms using tree structures for decision-making and classification.",
            "slug": "decision-tree-learning",
            "tags": ["decision-tree", "classification", "ml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ml_ann",
            "name": "Artificial Neural Networks",
            "shortName": "ann",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 3,
            "description": "Introduction to neural networks, architectures, and learning algorithms.",
            "slug": "artificial-neural-networks",
            "tags": ["neural-networks", "deep-learning", "ml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ml_svm",
            "name": "Support Vector Machines",
            "shortName": "svm",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 4,
            "description": "Supervised learning models for classification and regression using hyperplanes.",
            "slug": "support-vector-machines",
            "tags": ["svm", "supervised", "ml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ml_bayesian",
            "name": "Bayesian Learning",
            "shortName": "bayesian-learning",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 5,
            "description": "Learning techniques based on Bayes theorem for probabilistic modeling and prediction.",
            "slug": "bayesian-learning",
            "tags": ["bayesian", "probability", "ml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ml_clustering",
            "name": "Clustering",
            "shortName": "clustering",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 6,
            "description": "Unsupervised learning methods to group similar data points together.",
            "slug": "clustering",
            "tags": ["clustering", "unsupervised", "ml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ml_hmm",
            "name": "Hidden Markov Models",
            "shortName": "hmm",
            "subjectId": "cuid_machine_learning_subject",
            "isparentTopic": true,
            "order": 7,
            "description": "Probabilistic models for sequential data and time series prediction.",
            "slug": "hidden-markov-models",
            "tags": ["hmm", "sequence", "ml"],
            "isPublic": true,
            "verified": true
        }
    ]

}

const SWData: SeedData = {
    subject: {
        "id": "cuid_software_engineering_subject",
        "order": 9,
        "name": "Software Engineering",
        "shortName": "SE",
        "description": "Comprehensive overview of software engineering including processes, models, requirements, design, testing, metrics, risk management, and quality assurance.",
        "slug": "software-engineering",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1161/1161043.png",
        "color": "#3B82F6",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Intermediate",
        "difficulty": 3
    }
    ,
    topics: [
        {
            "id": "topic_se_introduction",
            "name": "Introduction to Software Engineering",
            "shortName": "introduction-se",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 1,
            "description": "Overview of software engineering, importance, and key concepts.",
            "slug": "introduction-to-software-engineering",
            "tags": ["software-engineering", "basics", "overview"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_generic_process",
            "name": "A Generic View of Process",
            "shortName": "generic-process",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 2,
            "description": "Understanding software processes and their common framework.",
            "slug": "generic-view-of-process",
            "tags": ["process", "software", "framework"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_process_models",
            "name": "Process Models",
            "shortName": "process-models",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 3,
            "description": "Different software process models including Waterfall, Incremental, Spiral, and Agile.",
            "slug": "process-models",
            "tags": ["process-models", "waterfall", "agile"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_software_requirements",
            "name": "Software Requirements",
            "shortName": "software-requirements",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 4,
            "description": "Gathering and specifying software requirements for systems development.",
            "slug": "software-requirements",
            "tags": ["requirements", "specification", "software"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_requirements_engineering",
            "name": "Requirements Engineering Process",
            "shortName": "requirements-engineering",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 5,
            "description": "Steps in requirements engineering including elicitation, analysis, documentation, and validation.",
            "slug": "requirements-engineering-process",
            "tags": ["requirements", "engineering", "process"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_system_models",
            "name": "System Models",
            "shortName": "system-models",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 6,
            "description": "Different system modeling techniques including data flow diagrams, entity-relationship models, and UML diagrams.",
            "slug": "system-models",
            "tags": ["system", "models", "uml"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_design_engineering",
            "name": "Design Engineering",
            "shortName": "design-engineering",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 7,
            "description": "Principles of software design, design specifications, architectural and detailed design.",
            "slug": "design-engineering",
            "tags": ["design", "architecture", "software"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_testing_strategies",
            "name": "Testing Strategies",
            "shortName": "testing-strategies",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 8,
            "description": "Different testing strategies including unit, integration, system, and acceptance testing.",
            "slug": "testing-strategies",
            "tags": ["testing", "strategies", "software-quality"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_product_metrics",
            "name": "Product Metrics",
            "shortName": "product-metrics",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 9,
            "description": "Measurement of software product attributes like size, complexity, and quality.",
            "slug": "product-metrics",
            "tags": ["metrics", "product", "software"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_process_metrics",
            "name": "Metrics for Process & Products",
            "shortName": "process-metrics",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 10,
            "description": "Metrics to measure and improve software processes and product development.",
            "slug": "metrics-for-process-products",
            "tags": ["metrics", "process", "software"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_risk_management",
            "name": "Risk Management",
            "shortName": "risk-management",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 11,
            "description": "Identification, assessment, and mitigation of risks in software projects.",
            "slug": "risk-management",
            "tags": ["risk", "management", "software-projects"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_se_quality_management",
            "name": "Quality Management",
            "shortName": "quality-management",
            "subjectId": "cuid_software_engineering_subject",
            "isparentTopic": true,
            "order": 12,
            "description": "Software quality assurance, standards, reviews, and process improvement techniques.",
            "slug": "quality-management",
            "tags": ["quality", "management", "assurance"],
            "isPublic": true,
            "verified": true
        }
    ]

}

const DBMSData: SeedData = {
    subject: {
        "id": "cuid_dbms_subject",
        "order": 8,
        "name": "Database Management System",
        "shortName": "DBMS",
        "description": "Fundamental database concepts including ER diagrams, relational algebra and calculus, SQL, normalization, transactions, indexing, and query optimization.",
        "slug": "database-management-system",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/1065/1065646.png",
        "color": "#F43F5E",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Intermediate",
        "difficulty": 3
    }
    ,
    topics: [
        {
            "id": "topic_dbms_introduction",
            "name": "Introduction to Databases",
            "shortName": "intro-databases",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 1,
            "description": "Overview of databases, database types, advantages, and database management systems.",
            "slug": "introduction-to-databases",
            "tags": ["databases", "dbms", "basics"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_er_diagram",
            "name": "ER Diagram",
            "shortName": "er-diagram",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 2,
            "description": "Entity-Relationship diagrams, entities, relationships, and cardinality concepts.",
            "slug": "er-diagram",
            "tags": ["er-diagram", "entities", "relationships"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_relational_algebra",
            "name": "Relational Algebra",
            "shortName": "relational-algebra",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 3,
            "description": "Relational algebra operations including selection, projection, join, union, and difference.",
            "slug": "relational-algebra",
            "tags": ["algebra", "relational", "operations"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_relational_calculus",
            "name": "Relational Calculus",
            "shortName": "relational-calculus",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 4,
            "description": "Introduction to tuple and domain relational calculus and their use in queries.",
            "slug": "relational-calculus",
            "tags": ["calculus", "relational", "queries"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_sql",
            "name": "SQL",
            "shortName": "sql",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 5,
            "description": "Structured Query Language basics, DDL, DML, DCL, and SQL commands.",
            "slug": "sql",
            "tags": ["sql", "queries", "database"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_normalization",
            "name": "Normalization",
            "shortName": "normalization",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 6,
            "description": "Normalization concepts including 1NF, 2NF, 3NF, BCNF, and advantages of normalization.",
            "slug": "normalization",
            "tags": ["normalization", "database", "design"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_transactions",
            "name": "Transactions",
            "shortName": "transactions",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 7,
            "description": "Transaction management, ACID properties, concurrency, and recovery techniques.",
            "slug": "transactions",
            "tags": ["transactions", "concurrency", "acidity"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_indexing",
            "name": "Indexing",
            "shortName": "indexing",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 8,
            "description": "Indexing techniques for database optimization including B-trees and hashing.",
            "slug": "indexing",
            "tags": ["indexing", "optimization", "database"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dbms_query_optimization",
            "name": "Query Optimization",
            "shortName": "query-optimization",
            "subjectId": "cuid_dbms_subject",
            "isparentTopic": true,
            "order": 9,
            "description": "Techniques to optimize SQL queries, execution plans, and performance improvement.",
            "slug": "query-optimization",
            "tags": ["query", "optimization", "performance"],
            "isPublic": true,
            "verified": true
        }
    ]

}


const CNData: SeedData = {
    subject: {
        "id": "cuid_computer_network_subject",
        "order": 7,
        "name": "Computer Network",
        "shortName": "CN",
        "description": "Core networking concepts including protocols, reference models, transmission technologies, routing, IP/UDP/TCP, network security and management systems.",
        "slug": "computer-network",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/906/906334.png",
        "color": "#10B981",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Intermediate",
        "difficulty": 3
    }
    ,
    topics: [
        {
            "id": "topic_cn_concepts",
            "name": "Networking Concepts",
            "shortName": "networking-concepts",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 1,
            "description": "Introduction to networking concepts, communication principles, and networking applications.",
            "slug": "networking-concepts",
            "tags": ["network", "concepts", "basics"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_reference_models",
            "name": "Reference Models",
            "shortName": "reference-models",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 2,
            "description": "OSI and TCP/IP reference models, layers, and their functions.",
            "slug": "reference-models",
            "tags": ["osi", "tcp-ip", "layers"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_transmission",
            "name": "Transmission Environment & Technologies",
            "shortName": "transmission-tech",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 3,
            "description": "Transmission media, environment, wired and wireless technologies.",
            "slug": "transmission-environment-technologies",
            "tags": ["transmission", "media", "networking"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_routing",
            "name": "Routing Algorithms",
            "shortName": "routing-algorithms",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 4,
            "description": "Routing algorithms, distance vector, link state, and dynamic routing protocols.",
            "slug": "routing-algorithms",
            "tags": ["routing", "algorithms", "protocols"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_ip_udp_tcp",
            "name": "IP, UDP & TCP Protocols",
            "shortName": "ip-udp-tcp",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 5,
            "description": "Understanding IP addressing, UDP, TCP protocols and their functionality.",
            "slug": "ip-udp-tcp-protocols",
            "tags": ["ip", "tcp", "udp"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_ipv4_ipv6",
            "name": "IPv4 and IPv6",
            "shortName": "ipv4-ipv6",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 6,
            "description": "Differences between IPv4 and IPv6, addressing schemes and headers.",
            "slug": "ipv4-ipv6",
            "tags": ["ipv4", "ipv6", "addressing"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_reliable_transfer",
            "name": "Reliable Data Transfer Methods",
            "shortName": "reliable-transfer",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 7,
            "description": "Mechanisms to ensure reliable data delivery over networks.",
            "slug": "reliable-data-transfer",
            "tags": ["reliable", "transfer", "protocols"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_application_protocols",
            "name": "Application Protocols",
            "shortName": "application-protocols",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 8,
            "description": "Common network application protocols like HTTP, FTP, SMTP, DNS.",
            "slug": "application-protocols",
            "tags": ["http", "ftp", "dns", "smtp"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_network_security",
            "name": "Network Security",
            "shortName": "network-security",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 9,
            "description": "Principles of network security, encryption, authentication, and firewalls.",
            "slug": "network-security",
            "tags": ["security", "firewall", "encryption"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_network_management",
            "name": "Network Management Systems",
            "shortName": "network-management",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 10,
            "description": "Network monitoring, management tools, SNMP, and performance analysis.",
            "slug": "network-management-systems",
            "tags": ["management", "snmp", "monitoring"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cn_communication_perspectives",
            "name": "Perspectives of Communication Networks",
            "shortName": "communication-perspectives",
            "subjectId": "cuid_computer_network_subject",
            "isparentTopic": true,
            "order": 11,
            "description": "Understanding network communication from different perspectives and models.",
            "slug": "perspectives-communication-networks",
            "tags": ["communication", "networks", "models"],
            "isPublic": true,
            "verified": true
        }
    ]

}

const IOCData: SeedData = {
    subject: {
        "id": "cuid_intro_computers_subject",
        "order": 6,
        "name": "Introduction of Computers",
        "shortName": "Computers",
        "description": "Fundamental concepts of computer architecture including bus structure, I/O, subroutines, interrupts, DMA, memory, pipelines, and system calls.",
        "slug": "introduction-of-computers",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/2910/2910761.png",
        "color": "#F59E0B",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Beginner",
        "difficulty": 2
    }
    ,
    topics: [
        {
            "id": "topic_bus_structure",
            "name": "Bus Structure",
            "shortName": "bus-structure",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 1,
            "description": "Introduction to computer bus structure, data, address, and control buses.",
            "slug": "bus-structure",
            "tags": ["bus", "architecture", "computer-basics"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_basic_io",
            "name": "Basic I/O",
            "shortName": "basic-io",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 2,
            "description": "Basic input/output devices, operations, and I/O interfacing concepts.",
            "slug": "basic-io",
            "tags": ["io", "input-output", "computer-basics"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_subroutines",
            "name": "Subroutines",
            "shortName": "subroutines",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 3,
            "description": "Definition and use of subroutines, procedure calls, and stack management.",
            "slug": "subroutines",
            "tags": ["subroutine", "procedure", "stack"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_interrupt",
            "name": "Interrupt",
            "shortName": "interrupt",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 4,
            "description": "Concepts of interrupts, types of interrupts, and interrupt handling mechanisms.",
            "slug": "interrupt",
            "tags": ["interrupt", "cpu", "hardware"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_dma",
            "name": "DMA",
            "shortName": "dma",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 5,
            "description": "Direct Memory Access, its working and importance in data transfer.",
            "slug": "dma",
            "tags": ["dma", "memory", "data-transfer"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_ram_rom",
            "name": "RAM & ROM",
            "shortName": "ram-rom",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 6,
            "description": "Random Access Memory and Read-Only Memory concepts, types and uses.",
            "slug": "ram-rom",
            "tags": ["ram", "rom", "memory"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_pipeline",
            "name": "Pipeline",
            "shortName": "pipeline",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 7,
            "description": "Instruction pipelining, stages of pipeline, and hazards in pipelines.",
            "slug": "pipeline",
            "tags": ["pipeline", "cpu", "instruction"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_system_calls",
            "name": "System Calls",
            "shortName": "system-calls",
            "subjectId": "cuid_intro_computers_subject",
            "isparentTopic": true,
            "order": 8,
            "description": "Overview of system calls, types, and their role in OS and application interaction.",
            "slug": "system-calls",
            "tags": ["system-calls", "os", "kernel"],
            "isPublic": true,
            "verified": true
        }
    ]

}


const OSData: SeedData = {
    subject: {
        "id": "cuid_operating_system_subject",
        "order": 5,
        "name": "Operating System",
        "shortName": "OS",
        "description": "Core operating system concepts including process, thread, CPU scheduling, deadlock, synchronization, memory, disk and file management.",
        "slug": "operating-system",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/4248/4248443.png",
        "color": "#9333EA",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Intermediate",
        "difficulty": 3
    }
    ,
    topics: [
        {
            "id": "topic_os_process",
            "name": "Process",
            "shortName": "process",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 1,
            "description": "Introduction to processes, PCB, process states, and process lifecycle.",
            "slug": "process",
            "tags": ["process", "pcb", "os-basics"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_thread",
            "name": "Thread",
            "shortName": "thread",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 2,
            "description": "Understanding threads, multithreading, and thread models.",
            "slug": "thread",
            "tags": ["thread", "multithreading", "concurrency"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_cpu_scheduling",
            "name": "CPU Scheduling",
            "shortName": "cpu-scheduling",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 3,
            "description": "CPU scheduling algorithms like FCFS, SJF, Round Robin, and Priority Scheduling.",
            "slug": "cpu-scheduling",
            "tags": ["cpu", "scheduling", "algorithms"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_deadlock",
            "name": "Deadlock",
            "shortName": "deadlock",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 4,
            "description": "Deadlock conditions, prevention, avoidance, detection, and recovery.",
            "slug": "deadlock",
            "tags": ["deadlock", "process", "resources"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_synchronization",
            "name": "Synchronization",
            "shortName": "synchronization",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 5,
            "description": "Process and thread synchronization, semaphores, mutex, monitors, and race conditions.",
            "slug": "synchronization",
            "tags": ["synchronization", "semaphore", "mutex"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_memory_management",
            "name": "Memory Management",
            "shortName": "memory-management",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 6,
            "description": "Memory allocation, paging, segmentation, and virtual memory concepts.",
            "slug": "memory-management",
            "tags": ["memory", "paging", "segmentation"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_disk_management",
            "name": "Disk Management",
            "shortName": "disk-management",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 7,
            "description": "Disk scheduling algorithms, disk structure, and disk formatting.",
            "slug": "disk-management",
            "tags": ["disk", "storage", "scheduling"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_os_file_management",
            "name": "File Management",
            "shortName": "file-management",
            "subjectId": "cuid_operating_system_subject",
            "isparentTopic": true,
            "order": 8,
            "description": "File systems, file allocation methods, directories, and file operations.",
            "slug": "file-management",
            "tags": ["file-system", "directories", "files"],
            "isPublic": true,
            "verified": true
        }
    ]

}
const DsData: SeedData = {
    subject: {
        "id": "cuid_data_structure_subject",
        "order": 4,
        "name": "Data Structure",
        "shortName": "DS",
        "description": "Fundamental concepts of data structures including searching, sorting, stack, queue, linked list, tree, and graph.",
        "slug": "data-structure",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/906/906334.png",
        "color": "#2563EB",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Beginner",
        "difficulty": 2
    }

    ,
    topics: [
        {
            "id": "cuid_ds_1",
            "name": "Searching",
            "subjectId": "cuid_data_structure_subject",
            "slug": "searching",
            "order": 1,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        },
        {
            "id": "cuid_ds_2",
            "name": "Sorting",
            "subjectId": "cuid_data_structure_subject",
            "slug": "sorting",
            "order": 2,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        },
        {
            "id": "cuid_ds_3",
            "name": "Stack",
            "subjectId": "cuid_data_structure_subject",
            "slug": "stack",
            "order": 3,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        },
        {
            "id": "cuid_ds_4",
            "name": "Queue",
            "subjectId": "cuid_data_structure_subject",
            "slug": "queue",
            "order": 4,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        },
        {
            "id": "cuid_ds_5",
            "name": "Linked List",
            "subjectId": "cuid_data_structure_subject",
            "slug": "linked-list",
            "order": 5,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        },
        {
            "id": "cuid_ds_6",
            "name": "Tree",
            "subjectId": "cuid_data_structure_subject",
            "slug": "tree",
            "order": 6,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        },
        {
            "id": "cuid_ds_7",
            "name": "Graph",
            "subjectId": "cuid_data_structure_subject",
            "slug": "graph",
            "order": 7,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added",
            "isPublic": true,
            "verified": false
        }
    ]

}
const UnixData: SeedData = {
    subject: {
        "id": "cuid_unix_subject",
        "order": 3,
        "name": "Unix and Shell Programming",
        "shortName": "UNIX",
        "description": "Unix commands, shell scripting, vi editor, file system handling, environment variables and wildcards.",
        "slug": "unix-shell-programming",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/4248/4248443.png",
        "color": "#0F766E",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Beginner",
        "difficulty": 2
    },

    topics: [
        {
            "name": "ls Command and Options",
            "subjectId": "cuid_unix_subject",
            "slug": "ls-command-and-options",
            "order": 1,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "ps Command and Options",
            "subjectId": "cuid_unix_subject",
            "slug": "ps-command-and-options",
            "order": 2,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "pwd Command",
            "subjectId": "cuid_unix_subject",
            "slug": "pwd-command",
            "order": 3,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "mv Command",
            "subjectId": "cuid_unix_subject",
            "slug": "mv-command",
            "order": 4,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "cp Command",
            "subjectId": "cuid_unix_subject",
            "slug": "cp-command",
            "order": 5,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "touch Command",
            "subjectId": "cuid_unix_subject",
            "slug": "touch-command",
            "order": 6,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "cat Command",
            "subjectId": "cuid_unix_subject",
            "slug": "cat-command",
            "order": 7,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "time Command",
            "subjectId": "cuid_unix_subject",
            "slug": "time-command",
            "order": 8,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "cal Command",
            "subjectId": "cuid_unix_subject",
            "slug": "cal-command",
            "order": 9,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "bc Command",
            "subjectId": "cuid_unix_subject",
            "slug": "bc-command",
            "order": 10,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "sort Command",
            "subjectId": "cuid_unix_subject",
            "slug": "sort-command",
            "order": 11,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "diff Command",
            "subjectId": "cuid_unix_subject",
            "slug": "diff-command",
            "order": 12,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "wc Command",
            "subjectId": "cuid_unix_subject",
            "slug": "wc-command",
            "order": 13,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "comm Command",
            "subjectId": "cuid_unix_subject",
            "slug": "comm-command",
            "order": 14,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "ln Command",
            "subjectId": "cuid_unix_subject",
            "slug": "ln-command",
            "order": 15,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "du Command",
            "subjectId": "cuid_unix_subject",
            "slug": "du-command",
            "order": 16,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "kill Command",
            "subjectId": "cuid_unix_subject",
            "slug": "kill-command",
            "order": 17,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "sleep Command",
            "subjectId": "cuid_unix_subject",
            "slug": "sleep-command",
            "order": 18,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "chmod Command",
            "subjectId": "cuid_unix_subject",
            "slug": "chmod-command",
            "order": 19,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "chown Command",
            "subjectId": "cuid_unix_subject",
            "slug": "chown-command",
            "order": 20,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "chgrp Command",
            "subjectId": "cuid_unix_subject",
            "slug": "chgrp-command",
            "order": 21,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "top Command",
            "subjectId": "cuid_unix_subject",
            "slug": "top-command",
            "order": 22,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "nice Command",
            "subjectId": "cuid_unix_subject",
            "slug": "nice-command",
            "order": 23,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "renice Command",
            "subjectId": "cuid_unix_subject",
            "slug": "renice-command",
            "order": 24,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "cut Command",
            "subjectId": "cuid_unix_subject",
            "slug": "cut-command",
            "order": 25,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "paste Command",
            "subjectId": "cuid_unix_subject",
            "slug": "paste-command",
            "order": 26,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "grep Command",
            "subjectId": "cuid_unix_subject",
            "slug": "grep-command",
            "order": 27,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "file Command",
            "subjectId": "cuid_unix_subject",
            "slug": "file-command",
            "order": 28,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "whereis Command",
            "subjectId": "cuid_unix_subject",
            "slug": "whereis-command",
            "order": 29,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "which Command",
            "subjectId": "cuid_unix_subject",
            "slug": "which-command",
            "order": 30,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "echo Command",
            "subjectId": "cuid_unix_subject",
            "slug": "echo-command",
            "order": 31,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "env Command",
            "subjectId": "cuid_unix_subject",
            "slug": "env-command",
            "order": 32,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "PATH Variable",
            "subjectId": "cuid_unix_subject",
            "slug": "path-variable",
            "order": 33,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "CLASSPATH Variable",
            "subjectId": "cuid_unix_subject",
            "slug": "classpath-variable",
            "order": 34,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "find Command",
            "subjectId": "cuid_unix_subject",
            "slug": "find-command",
            "order": 35,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "vi Editor",
            "subjectId": "cuid_unix_subject",
            "slug": "vi-editor",
            "order": 36,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "Shell",
            "subjectId": "cuid_unix_subject",
            "slug": "shell",
            "order": 37,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "Wildcards",
            "subjectId": "cuid_unix_subject",
            "slug": "wildcards",
            "order": 38,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "Shell Script",
            "subjectId": "cuid_unix_subject",
            "slug": "shell-script",
            "order": 39,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        },
        {
            "name": "Brace Expansion {}",
            "subjectId": "cuid_unix_subject",
            "slug": "brace-expansion",
            "order": 40,
            "isparentTopic": false,
            "description": "No description provided",
            "content": "no content added ",
            "isPublic": true,
            "verified": false,
        }
    ]

    // Example TargetExam ID - Replace with a valid ID from your DB if you want to test linking
    // targetExamId: "some-target-exam-id" 
};
const cProgrammingData: SeedData = {
    subject: {
        "id": "c_programming_subject_id",
        "order": 1,
        "name": "C Programming",
        "shortName": "C",
        "description": "Master C programming fundamentals with topics covering variables, control flow, functions, pointers, memory, and file handling.",
        "slug": "c-programming",
        "iconUrl": "/icons/c.svg",
        "color": "#00599C",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Beginner",
        "difficulty": 2
    },
    topics: [
        {
            "id": "topic_variables_datatypes",
            "name": "Variables and Data Types",
            "shortName": "variables-datatypes",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 1,
            "description": "Introduction to variables, built-in data types, constants, and type modifiers in C.",
            "slug": "variables-and-data-types",
            "tags": ["variables", "datatypes", "basics"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_io_operations",
            "name": "Input and Output Operations",
            "shortName": "io",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 2,
            "description": "scanf, printf, format specifiers, character and string input-output functions.",
            "slug": "input-output-operations",
            "tags": ["io", "scanf", "printf"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_operators_expressions",
            "name": "Operators and Expressions",
            "shortName": "operators",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 3,
            "description": "Arithmetic, logical, relational, bitwise operators and C expressions.",
            "slug": "operators-and-expressions",
            "tags": ["operators", "expressions"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_control_flow",
            "name": "Control Flow Statements",
            "shortName": "control-flow",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 4,
            "description": "Conditional statements, loops, switch-case, break, continue, goto.",
            "slug": "control-flow-statements",
            "tags": ["if", "loops", "switch"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_functions",
            "name": "C Functions",
            "shortName": "c-functions",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 5,
            "description": "Function declaration, definition, call, recursion, parameter passing.",
            "slug": "c-functions",
            "tags": ["functions", "recursion"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_arrays",
            "name": "Arrays",
            "shortName": "arrays",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 6,
            "description": "1D, 2D arrays, multi-dimensional arrays, operations on arrays.",
            "slug": "arrays",
            "tags": ["arrays"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_pointers",
            "name": "C Pointers",
            "shortName": "c-pointers",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 7,
            "description": "Pointer declaration, pointer arithmetic, pointer to functions, pointer to arrays.",
            "slug": "c-pointers",
            "tags": ["pointers", "memory"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_strings",
            "name": "String Handling",
            "shortName": "strings",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 8,
            "description": "String arrays, string functions, character arrays, memory handling.",
            "slug": "string-handling",
            "tags": ["strings", "string-functions"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_structures_unions",
            "name": "Structures and Unions",
            "shortName": "struct-union",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 9,
            "description": "User-defined data types such as structures and unions, memory layout.",
            "slug": "structures-and-unions",
            "tags": ["struct", "union", "udt"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_file_handling",
            "name": "File Handling",
            "shortName": "files",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 10,
            "description": "File operations such as reading, writing, appending, file pointers.",
            "slug": "file-handling",
            "tags": ["files", "fopen", "fread"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_preprocessor",
            "name": "Preprocessor Directives",
            "shortName": "preprocessor",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 11,
            "description": "#include, #define, macros, conditional compilation.",
            "slug": "preprocessor-directives",
            "tags": ["preprocessor", "macros"],
            "isPublic": true,
            "verified": true
        },
        {
            "id": "topic_cli_args",
            "name": "Command Line Arguments",
            "shortName": "cli",
            "subjectId": "c_programming_subject_id",
            "isparentTopic": true,
            "order": 12,
            "description": "argc, argv, handling command-line based input.",
            "slug": "command-line-arguments",
            "tags": ["cli", "argv", "argc"],
            "isPublic": true,
            "verified": true
        }
    ],
    // Example TargetExam ID - Replace with a valid ID from your DB if you want to test linking
    // targetExamId: "some-target-exam-id" 
};
const cppOOPData: SeedData = {
    subject: {
        "id": "cuid_cpp_subject",
        "order": 2,
        "name": "Object Oriented Programming in C++",
        "shortName": "C++ OOP",
        "description": "Comprehensive C++ programming and Object-Oriented Programming concepts.",
        "slug": "object-oriented-programming-cpp",
        "iconUrl": "https://cdn-icons-png.flaticon.com/512/6132/6132222.png",
        "color": "#2965F1",
        "isPublic": true,
        "category": "Computer Science",
        "level": "Intermediate",
        "difficulty": 3
    }
    ,
    topics: [
        {
            "id": "topic_oop_data_types",
            "name": "Data Types",
            "shortName": "data-types",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 1,
            "description": "Built-in and user-defined data types in C++.",
            "slug": "data-types",
            "tags": ["datatypes", "basics"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_if_else",
            "name": "If / Else If / Else",
            "shortName": "if-else",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 2,
            "description": "Decision-making using if, else if, and else conditions.",
            "slug": "if-else-statements",
            "tags": ["if", "condition", "control-flow"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_loops",
            "name": "Loops",
            "shortName": "loops",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 3,
            "description": "For, while, do-while loops in C++.",
            "slug": "loops",
            "tags": ["loops", "iteration"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_functions",
            "name": "Functions",
            "shortName": "functions",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 4,
            "description": "Function declaration, definition, return types, parameters.",
            "slug": "functions",
            "tags": ["functions", "procedures"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_switch_case",
            "name": "Switch Case",
            "shortName": "switch",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 5,
            "description": "Decision-making using switch statements.",
            "slug": "switch-case",
            "tags": ["switch", "control-flow"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_pointer",
            "name": "Pointers",
            "shortName": "pointers",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 6,
            "description": "Pointer basics, pointer arithmetic, function pointers.",
            "slug": "pointers",
            "tags": ["pointer", "memory"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_structure",
            "name": "Structure",
            "shortName": "structure",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 7,
            "description": "User-defined data type using struct keyword.",
            "slug": "structures",
            "tags": ["structure", "user-defined"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_array",
            "name": "Array",
            "shortName": "array",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 8,
            "description": "1D and 2D arrays in C++.",
            "slug": "array",
            "tags": ["array"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_string",
            "name": "String",
            "shortName": "string",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 9,
            "description": "C-style strings and std::string.",
            "slug": "string",
            "tags": ["string", "cstring"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_function_overloading",
            "name": "Function Overloading",
            "shortName": "function-overloading",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 10,
            "description": "Same function name with different parameter lists.",
            "slug": "function-overloading",
            "tags": ["polymorphism", "overloading"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_function_templates",
            "name": "Function Templates",
            "shortName": "function-templates",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 11,
            "description": "Using templates for generic functions.",
            "slug": "function-templates",
            "tags": ["template", "generic"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_scope",
            "name": "Scope of Variables",
            "shortName": "scope",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 12,
            "description": "Local, global, static, and block scope.",
            "slug": "scope-of-variables",
            "tags": ["scope", "variables"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_type_aliases",
            "name": "Type Aliases (typedef / using)",
            "shortName": "type-alias",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 13,
            "description": "Using typedef and using for renaming types.",
            "slug": "type-aliases",
            "tags": ["typedef", "using"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_unions",
            "name": "Unions",
            "shortName": "unions",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 14,
            "description": "Memory-efficient user-defined data type.",
            "slug": "unions",
            "tags": ["union"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_enum",
            "name": "Enumerated Types (enum)",
            "shortName": "enum",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 15,
            "description": "Declaring and using enumeration types.",
            "slug": "enumerated-types",
            "tags": ["enum"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_class",
            "name": "Class",
            "shortName": "class",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 16,
            "description": "Basics of objects and classes.",
            "slug": "class",
            "tags": ["class", "object"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_constructors",
            "name": "Constructors",
            "shortName": "constructors",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 17,
            "description": "Special member functions used to initialize objects.",
            "slug": "constructors",
            "tags": ["constructor"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_overloading_constructors",
            "name": "Overloading Constructors",
            "shortName": "constructor-overload",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 18,
            "description": "Multiple constructors with different parameters.",
            "slug": "overloading-constructors",
            "tags": ["constructor", "overloading"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_member_init_list",
            "name": "Member Initialization in Constructors",
            "shortName": "init-list",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 19,
            "description": "Using initializer lists to initialize members.",
            "slug": "member-initialization",
            "tags": ["constructor", "initializer-list"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_pointer_to_class",
            "name": "Pointers to Classes",
            "shortName": "class-pointer",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 20,
            "description": "Using pointers with objects and classes.",
            "slug": "pointers-to-classes",
            "tags": ["pointers", "objects"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_operator_overloading",
            "name": "Operator Overloading",
            "shortName": "operator-overloading",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 21,
            "description": "Overloading operators for custom behavior.",
            "slug": "operator-overloading",
            "tags": ["operator", "overloading"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_this_keyword",
            "name": "Keyword this",
            "shortName": "this",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 22,
            "description": "Using the this pointer in classes.",
            "slug": "this-keyword",
            "tags": ["this", "pointer"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_static_members",
            "name": "Static Members",
            "shortName": "static",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 23,
            "description": "Static data members and static functions.",
            "slug": "static-members",
            "tags": ["static"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_const_member_functions",
            "name": "Const Member Functions",
            "shortName": "const-fn",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 24,
            "description": "Declaring member functions as const.",
            "slug": "const-member-functions",
            "tags": ["const", "member-function"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_class_templates",
            "name": "Class Templates",
            "shortName": "class-templates",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 25,
            "description": "Generic programming using class templates.",
            "slug": "class-templates",
            "tags": ["templates", "generic"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_template_specialization",
            "name": "Template Specialization",
            "shortName": "template-specialization",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 26,
            "description": "Specializing templates for specific types.",
            "slug": "template-specialization",
            "tags": ["template", "specialization"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_namespace",
            "name": "Namespace",
            "shortName": "namespace",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 27,
            "description": "Organizing code using namespaces.",
            "slug": "namespace",
            "tags": ["namespace"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_friendship",
            "name": "Friendship (Friend Functions & Friend Classes)",
            "shortName": "friendship",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 28,
            "description": "Granting private access using friend keyword.",
            "slug": "friendship",
            "tags": ["friend-class", "friend-function"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_inheritance",
            "name": "Inheritance",
            "shortName": "inheritance",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 29,
            "description": "Types of inheritance and reuse of code.",
            "slug": "inheritance",
            "tags": ["inheritance"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_polymorphism",
            "name": "Polymorphism",
            "shortName": "polymorphism",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 30,
            "description": "Compile-time and runtime polymorphism.",
            "slug": "polymorphism",
            "tags": ["polymorphism"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_virtual_members",
            "name": "Virtual Members",
            "shortName": "virtual",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 31,
            "description": "Virtual functions and runtime polymorphism.",
            "slug": "virtual-members",
            "tags": ["virtual", "runtime"],
            "verified": true,
            "isPublic": true
        },
        {
            "id": "topic_oop_abstract_class",
            "name": "Abstract Base Class",
            "shortName": "abstract-class",
            "subjectId": "oop_subject_id",
            "isparentTopic": true,
            "order": 32,
            "description": "Pure virtual functions and abstract classes.",
            "slug": "abstract-base-class",
            "tags": ["abstract", "pure-virtual"],
            "verified": true,
            "isPublic": true
        }
    ]



}


// Interfaces for the input data
interface TopicInput {
    id?: string;
    name: string;
    shortName?: string;
    subjectId: string;
    isparentTopic?: boolean;
    order: number;
    description?: string;
    slug: string;
    tags?: string[];
    isPublic?: boolean;
    verified?: boolean;
    content?: string;
}

interface SubjectInput {
    id?: string;
    order: number;
    name: string;
    shortName?: string;
    description?: string;
    slug: string;
    iconUrl?: string;
    color?: string;
    isPublic?: boolean;
    category: string; // This is the category name
    level?: string;
    difficulty?: number;
}

interface SeedData {
    subject: SubjectInput;
    topics: TopicInput[];
    targetExamId?: string; // Optional TargetExam ID to link the category to
}

async function addSubjectsAndTopics(data: SeedData) {
    console.log(`Seeding subject: ${data.subject.name}`);

    // 1. Upsert Category
    const categorySlug = data.subject.category.toLowerCase().replace(/\s+/g, '-');
    const category = await prisma.category.upsert({
        where: { name: data.subject.category },
        update: {},
        create: {
            name: data.subject.category,
            slug: categorySlug,
            description: `Category for ${data.subject.category}`,
        },
    });
    console.log(`Category upserted: ${category.name}`);

    // 2. Link Category to TargetExam if provided
    if (data.targetExamId) {
        // Check if TargetExam exists
        const targetExam = await prisma.targetExam.findUnique({
            where: { id: data.targetExamId },
        });

        if (targetExam) {
            await prisma.targetExam.update({
                where: { id: data.targetExamId },
                data: {
                    Category: {
                        connect: { id: category.id },
                    },
                },
            });
            console.log(`Linked Category ${category.name} to TargetExam ${targetExam.name}`);
        } else {
            console.warn(`TargetExam with ID ${data.targetExamId} not found. Skipping link.`);
        }
    }

    // 3. Upsert Subject
    const subject = await prisma.subject.upsert({
        where: { slug: data.subject.slug },
        update: {
            order: data.subject.order,
            name: data.subject.name,
            shortName: data.subject.shortName,
            description: data.subject.description,
            iconUrl: data.subject.iconUrl,
            color: data.subject.color,
            isPublic: data.subject.isPublic,
            category: data.subject.category, // Keep the string field for now
            categoryId: category.id, // Link to the Category model
            level: data.subject.level,
            difficulty: data.subject.difficulty,
        },
        create: {
            // id: data.subject.id,
            order: data.subject.order,
            name: data.subject.name,
            shortName: data.subject.shortName,
            description: data.subject.description,
            slug: data.subject.slug,
            iconUrl: data.subject.iconUrl,
            color: data.subject.color,
            isPublic: data.subject.isPublic,
            category: data.subject.category,
            categoryId: category.id,
            level: data.subject.level,
            difficulty: data.subject.difficulty,
        },
    });

    console.log(`Subject upserted: ${subject.name}`);

    // 4. Upsert Topics
    for (const topicData of data.topics) {
        await prisma.topic.upsert({
            where: { slug: topicData.slug },
            update: {
                name: topicData.name,
                shortName: topicData.shortName,
                subjectId: subject.id,
                isparentTopic: topicData.isparentTopic,
                order: topicData.order,
                description: topicData.description,
                tags: topicData.tags,
                isPublic: topicData.isPublic,
                verified: topicData.verified,
                content: topicData.content || "no content added ",
            },
            create: {
                // id: topicData.id,
                name: topicData.name,
                shortName: topicData.shortName,
                subjectId: subject.id,
                isparentTopic: topicData.isparentTopic,
                order: topicData.order,
                description: topicData.description,
                slug: topicData.slug,
                tags: topicData.tags,
                isPublic: topicData.isPublic,
                verified: topicData.verified,
                content: topicData.content || "no content added ",
            },
        });
    }
    console.log(`Processed ${data.topics.length} topics for ${subject.name}`);
}



async function main() {
    await addSubjectsAndTopics(cProgrammingData);
    await addSubjectsAndTopics(OSData);
    await addSubjectsAndTopics(cppOOPData);
    await addSubjectsAndTopics(UnixData);
    await addSubjectsAndTopics(DsData);
    await addSubjectsAndTopics(IOCData);
    await addSubjectsAndTopics(CNData);
    await addSubjectsAndTopics(DBMSData);
    await addSubjectsAndTopics(SWData);
    await addSubjectsAndTopics(MLData);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

