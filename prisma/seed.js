import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ipcSectionsData } from './ipcData.js';
import { bnsSectionsData } from './bnsData.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing seed data
  // We can delete by matching emails/phones of our mock data to avoid deleting real user data,
  // or do a clean reset of mock records. Let's delete reviews first, then advocates/users.
  const mockUserEmails = [
    'client.rahul@example.com',
    'client.ananya@example.com',
    'client.rohit@example.com',
    'client.pooja@example.com',
    'client.vikram@example.com',
    'client.sneha@example.com',
    'client.amit@example.com',
    'client.rajesh@example.com',
    'client.neha@example.com',
    'client.priya@example.com'
  ];
  const mockAdvocateEmails = [
    'adv.rajesh@example.com',
    'adv.priya@example.com',
    'adv.amit@example.com',
    'adv.sneha@example.com',
    'adv.vikram@example.com',
    'adv.meera@example.com'
  ];

  console.log('Cleaning up existing mock data...');

  await prisma.review.deleteMany({
    where: {
      OR: [
        { user: { email: { in: mockUserEmails } } },
        { advocate: { email: { in: mockAdvocateEmails } } },
        { advocate: { email: { startsWith: 'adv.gen.' } } }
      ]
    }
  });

  await prisma.user.deleteMany({
    where: { email: { in: mockUserEmails } }
  });

  await prisma.advocate.deleteMany({
    where: {
      OR: [
        { email: { in: mockAdvocateEmails } },
        { email: { startsWith: 'adv.gen.' } }
      ]
    }
  });

  console.log('Cleanup completed. Hashing password...');
  const passwordHash = await bcrypt.hash('Password123', 10);

  // 2. Seed Mock Users
  console.log('Seeding users...');
  const users = await Promise.all([
    prisma.user.create({
      data: {
        fullName: 'Rahul Verma',
        email: 'client.rahul@example.com',
        phone: '9876543210',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        latitude: 28.6304,
        longitude: 77.2177,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Ananya Sen',
        email: 'client.ananya@example.com',
        phone: '9876543211',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        latitude: 18.9696,
        longitude: 72.8230,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Rohit Nair',
        email: 'client.rohit@example.com',
        phone: '9876543212',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        latitude: 12.9716,
        longitude: 77.5946,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Pooja Patel',
        email: 'client.pooja@example.com',
        phone: '9876543213',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '380001',
        latitude: 23.0225,
        longitude: 72.5714,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Vikram Rao',
        email: 'client.vikram@example.com',
        phone: '9876543214',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500001',
        latitude: 17.3850,
        longitude: 78.4867,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Sneha Reddy',
        email: 'client.sneha@example.com',
        phone: '9876543215',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        latitude: 13.0827,
        longitude: 80.2707,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Amit Kumar',
        email: 'client.amit@example.com',
        phone: '9876543216',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        latitude: 28.5800,
        longitude: 77.3300,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Rajesh Gupta',
        email: 'client.rajesh@example.com',
        phone: '9876543217',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226001',
        latitude: 26.8467,
        longitude: 80.9462,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Neha Singh',
        email: 'client.neha@example.com',
        phone: '9876543218',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700001',
        latitude: 22.5726,
        longitude: 88.3639,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        fullName: 'Priya Verma',
        email: 'client.priya@example.com',
        phone: '9876543219',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        latitude: 18.5284,
        longitude: 73.8739,
        emailVerified: true,
        phoneVerified: true,
        isActive: true
      }
    })
  ]);

  console.log(`Seeded ${users.length} users successfully.`);

  // 3. Seed Mock Advocates
  console.log('Seeding advocates...');
  const advocatesData = [
    {
      fullName: 'Adv. Rajesh Sharma',
      email: 'adv.rajesh@example.com',
      phone: '9999999901',
      phoneVerified: true,
      emailVerified: true,
      gender: 'Male',
      barCouncilId: 'BCI/DL/12345/2012',
      aadhaarNumber: '123456789012',
      passwordHash,
      languagesSpoken: ['English', 'Hindi', 'Punjabi'],
      country: 'India',
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110002',
      latitude: 28.6438,
      longitude: 77.2415,
      isActive: true,
      experienceYears: 14,
      casesHandled: 245,
      bestPracticeArea: 'Criminal Law',
      about: 'A veteran advocate specializing in complex criminal trials, bail matters, and appellate litigation. Practicing in the High Court of Delhi and the Supreme Court of India with a proven track record of securing justice for clients.',
      courtPractice: ['Delhi High Court', 'Supreme Court of India', 'Patiala House Courts'],
      completeAddress: 'Chamber 405, Lawyers Chamber Block, Delhi High Court, New Delhi',
      videoCallChargePerMinute: 60.00,
      voiceCallChargePerMinute: 40.00,
      offlineVisitingFee: 2500.00,
      practiceAreas: ['Criminal Law', 'Civil Law', 'Constitutional Law'],
      topCourtPractised: 'Supreme Court of India',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60'
    },
    {
      fullName: 'Adv. Priya Patel',
      email: 'adv.priya@example.com',
      phone: '9999999902',
      phoneVerified: true,
      emailVerified: true,
      gender: 'Female',
      barCouncilId: 'BCI/MH/54321/2016',
      aadhaarNumber: '234567890123',
      passwordHash,
      languagesSpoken: ['English', 'Gujarati', 'Marathi'],
      country: 'India',
      state: 'Maharashtra',
      city: 'Mumbai',
      pincode: '400021',
      latitude: 18.9256,
      longitude: 72.8242,
      isActive: true,
      experienceYears: 8,
      casesHandled: 110,
      bestPracticeArea: 'Corporate Law',
      about: 'Specializes in corporate advisory, merger and acquisitions, compliance auditing, and intellectual property disputes. Providing strategic advice to high-growth startups and established multinational corporations.',
      courtPractice: ['Bombay High Court', 'NCLT Mumbai', 'City Civil Court Mumbai'],
      completeAddress: 'Office 702, Nariman Point, Marine Drive, Mumbai',
      videoCallChargePerMinute: 80.00,
      voiceCallChargePerMinute: 50.00,
      offlineVisitingFee: 3500.00,
      practiceAreas: ['Corporate Law', 'Intellectual Property', 'Labor Law'],
      topCourtPractised: 'Bombay High Court',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
    },
    {
      fullName: 'Adv. Amit Verma',
      email: 'adv.amit@example.com',
      phone: '9999999903',
      phoneVerified: true,
      emailVerified: true,
      gender: 'Male',
      barCouncilId: 'BCI/UP/78901/2014',
      aadhaarNumber: '345678901234',
      passwordHash,
      languagesSpoken: ['English', 'Hindi'],
      country: 'India',
      state: 'Uttar Pradesh',
      city: 'Noida',
      pincode: '201301',
      latitude: 28.5800,
      longitude: 77.3300,
      isActive: true,
      experienceYears: 10,
      casesHandled: 180,
      bestPracticeArea: 'Real Estate Law',
      about: 'Expert in real estate regulations, property disputes, land acquisition cases, and RERA complaints. Helping property buyers and developers navigate land titles, documentation, and litigation issues smoothly.',
      courtPractice: ['Allahabad High Court', 'RERA Tribunal Lucknow', 'Gautam Buddha Nagar District Court'],
      completeAddress: 'Suite 204, Commercial Belt, Alpha 1, Greater Noida, UP',
      videoCallChargePerMinute: 50.00,
      voiceCallChargePerMinute: 30.00,
      offlineVisitingFee: 1500.00,
      practiceAreas: ['Real Estate Law', 'Civil Law', 'Tax Law'],
      topCourtPractised: 'Allahabad High Court',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60'
    },
    {
      fullName: 'Adv. Sneha Iyer',
      email: 'adv.sneha@example.com',
      phone: '9999999904',
      phoneVerified: true,
      emailVerified: true,
      gender: 'Female',
      barCouncilId: 'BCI/KA/34567/2018',
      aadhaarNumber: '456789012345',
      passwordHash,
      languagesSpoken: ['English', 'Tamil', 'Kannada'],
      country: 'India',
      state: 'Karnataka',
      city: 'Bengaluru',
      pincode: '560025',
      latitude: 12.9619,
      longitude: 77.6015,
      isActive: true,
      experienceYears: 6,
      casesHandled: 65,
      bestPracticeArea: 'Family Law',
      about: 'Passionate family law attorney working on divorce settlements, child custody matters, maintenance claims, and domestic disputes. Dedicated to providing empathetic, constructive, and legally solid resolutions.',
      courtPractice: ['Karnataka High Court', 'Family Court Bengaluru', 'District Court Bengaluru'],
      completeAddress: 'Chamber 12, Cunningham Road, Vasanth Nagar, Bengaluru',
      videoCallChargePerMinute: 45.00,
      voiceCallChargePerMinute: 25.00,
      offlineVisitingFee: 1200.00,
      practiceAreas: ['Family Law', 'Civil Law'],
      topCourtPractised: 'Karnataka High Court',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=60'
    },
    {
      fullName: 'Adv. Vikram Singh',
      email: 'adv.vikram@example.com',
      phone: '9999999905',
      phoneVerified: true,
      emailVerified: true,
      gender: 'Male',
      barCouncilId: 'BCI/RJ/98765/2010',
      aadhaarNumber: '567890123456',
      passwordHash,
      languagesSpoken: ['English', 'Hindi', 'Rajasthani'],
      country: 'India',
      state: 'Rajasthan',
      city: 'Jaipur',
      pincode: '302001',
      latitude: 26.9124,
      longitude: 75.7873,
      isActive: true,
      experienceYears: 16,
      casesHandled: 310,
      bestPracticeArea: 'Tax Law',
      about: 'Providing premium counsel for direct and indirect taxation, corporate restructuring, GST compliance, and customs cases. Has successfully represented clients before appellate tribunals and the High Courts.',
      courtPractice: ['Rajasthan High Court', 'Income Tax Appellate Tribunal', 'Supreme Court of India'],
      completeAddress: '45, Civil Lines, Near Governor House, Jaipur, Rajasthan',
      videoCallChargePerMinute: 75.00,
      voiceCallChargePerMinute: 50.00,
      offlineVisitingFee: 3000.00,
      practiceAreas: ['Tax Law', 'Corporate Law', 'Civil Law'],
      topCourtPractised: 'Rajasthan High Court',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60'
    },
    {
      fullName: 'Adv. Meera Nair',
      email: 'adv.meera@example.com',
      phone: '9999999906',
      phoneVerified: true,
      emailVerified: true,
      gender: 'Female',
      barCouncilId: 'BCI/KL/23456/2015',
      aadhaarNumber: '678901234567',
      passwordHash,
      languagesSpoken: ['English', 'Malayalam', 'Tamil'],
      country: 'India',
      state: 'Kerala',
      city: 'Kochi',
      pincode: '682011',
      latitude: 9.9700,
      longitude: 76.2800,
      isActive: true,
      experienceYears: 11,
      casesHandled: 145,
      bestPracticeArea: 'Environmental Law',
      about: 'A dedicated environmental advocate fighting for sustainable industrial development, environmental audits, coastal regulation compliance, and public interest litigations targeting ecological protection.',
      courtPractice: ['Kerala High Court', 'National Green Tribunal Chennai', 'District Court Ernakulam'],
      completeAddress: 'Green Legal Chambers, Marine Drive, Kochi, Kerala',
      videoCallChargePerMinute: 55.00,
      voiceCallChargePerMinute: 35.00,
      offlineVisitingFee: 2000.00,
      practiceAreas: ['Environmental Law', 'Constitutional Law', 'Real Estate Law'],
      topCourtPractised: 'Kerala High Court',
      profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60'
    }
  ];

  // Let's generate 40 additional advocates programmatically
  const maleFirstNames = ['Aarav', 'Abhishek', 'Aditya', 'Ajay', 'Akash', 'Alok', 'Arjun', 'Arvind', 'Deepak', 'Gaurav', 'Karan', 'Kunal', 'Manish', 'Manoj', 'Nikhil', 'Pankaj', 'Pradeep', 'Ravi', 'Sanjay', 'Saurabh'];
  const femaleFirstNames = ['Aditi', 'Anjali', 'Ankita', 'Divya', 'Kavita', 'Kiran', 'Megha', 'Nisha', 'Pooja', 'Poonam', 'Radhika', 'Ritu', 'Shalini', 'Shweta', 'Sunita', 'Swati', 'Vandana'];
  const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Mishra', 'Joshi', 'Trivedi', 'Mehta', 'Patel', 'Shah', 'Desai', 'Kulkarni', 'Reddy', 'Rao', 'Nair', 'Pillai', 'Sen', 'Chatterjee', 'Banerjee'];

  const locations = [
    { state: 'Delhi', city: 'New Delhi', pincode: '110001', latitude: 28.6304, longitude: 77.2177 },
    { state: 'Maharashtra', city: 'Mumbai', pincode: '400001', latitude: 18.9696, longitude: 72.8230 },
    { state: 'Maharashtra', city: 'Pune', pincode: '411001', latitude: 18.5284, longitude: 73.8739 },
    { state: 'Karnataka', city: 'Bengaluru', pincode: '560001', latitude: 12.9716, longitude: 77.5946 },
    { state: 'Tamil Nadu', city: 'Chennai', pincode: '600001', latitude: 13.0827, longitude: 80.2707 },
    { state: 'West Bengal', city: 'Kolkata', pincode: '700001', latitude: 22.5726, longitude: 88.3639 },
    { state: 'Uttar Pradesh', city: 'Noida', pincode: '201301', latitude: 28.5800, longitude: 77.3300 },
    { state: 'Uttar Pradesh', city: 'Lucknow', pincode: '226001', latitude: 26.8467, longitude: 80.9462 },
    { state: 'Gujarat', city: 'Ahmedabad', pincode: '380001', latitude: 23.0225, longitude: 72.5714 },
    { state: 'Rajasthan', city: 'Jaipur', pincode: '302001', latitude: 26.9124, longitude: 75.7873 },
    { state: 'Telangana', city: 'Hyderabad', pincode: '500001', latitude: 17.3850, longitude: 78.4867 },
    { state: 'Kerala', city: 'Kochi', pincode: '682001', latitude: 9.9816, longitude: 76.2999 }
  ];

  const practiceAreasList = [
    'Criminal Law', 'Civil Law', 'Family Law', 'Constitutional Law', 'Corporate Law',
    'Intellectual Property', 'Labor Law', 'Tax Law', 'Real Estate Law', 'Environmental Law'
  ];

  const courtsList = [
    'Supreme Court of India', 'Delhi High Court', 'Bombay High Court', 'Calcutta High Court',
    'Madras High Court', 'Allahabad High Court', 'Patna High Court', 'Karnataka High Court',
    'Gujarat High Court', 'Rajasthan High Court'
  ];

  const languagesList = ['English', 'Hindi', 'Marathi', 'Gujarati', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

  const malePhotos = [
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=60'
  ];

  const femalePhotos = [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60'
  ];

  for (let i = 1; i <= 40; i++) {
    const isMale = Math.random() > 0.5;
    const gender = isMale ? 'Male' : 'Female';
    const firstName = isMale
      ? maleFirstNames[Math.floor(Math.random() * maleFirstNames.length)]
      : femaleFirstNames[Math.floor(Math.random() * femaleFirstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `Adv. ${firstName} ${lastName}`;
    const email = `adv.gen.${i}@example.com`;
    const phone = `999999${(1000 + i).toString()}`;
    const barCouncilId = `BCI/GEN/${(20000 + i).toString()}/2019`;
    const aadhaarNumber = `98765432${(1000 + i).toString()}`;

    const loc = locations[Math.floor(Math.random() * locations.length)];
    const exp = 5 + Math.floor(Math.random() * 20); // 5 to 25 years exp
    const won = Math.floor(exp * (10 + Math.random() * 15)); // case won proportion

    // Pick 2-3 random practice areas
    const shuffedAreas = [...practiceAreasList].sort(() => 0.5 - Math.random());
    const practiceAreas = shuffedAreas.slice(0, 2 + Math.floor(Math.random() * 2));
    const bestPracticeArea = practiceAreas[0];

    // Pick 1-2 random courts
    const shuffledCourts = [...courtsList].sort(() => 0.5 - Math.random());
    const courtPractice = shuffledCourts.slice(0, 1 + Math.floor(Math.random() * 2));
    const topCourtPractised = courtPractice[0];

    // Pick 2-3 random languages
    const shuffledLangs = [...languagesList].sort(() => 0.5 - Math.random());
    const languagesSpoken = Array.from(new Set(['English', 'Hindi', ...shuffledLangs.slice(0, 1 + Math.floor(Math.random() * 2))]));

    const profilePhotoUrl = isMale
      ? malePhotos[Math.floor(Math.random() * malePhotos.length)]
      : femalePhotos[Math.floor(Math.random() * femalePhotos.length)];

    advocatesData.push({
      fullName,
      email,
      phone,
      phoneVerified: true,
      emailVerified: true,
      gender,
      barCouncilId,
      aadhaarNumber,
      passwordHash,
      languagesSpoken,
      country: 'India',
      state: loc.state,
      city: loc.city,
      pincode: loc.pincode,
      latitude: loc.latitude,
      longitude: loc.longitude,
      isActive: true,
      experienceYears: exp,
      casesHandled: won,
      bestPracticeArea,
      about: `Providing professional counsel with over ${exp} years of active practice. Specializes primarily in ${bestPracticeArea} litigation, representing diverse clients across tribunals and high courts. Committed to diligent representation.`,
      courtPractice,
      completeAddress: `Office No. ${100 + i}, Chamber Block, District Court Complex, ${loc.city}`,
      videoCallChargePerMinute: 30 + Math.floor(Math.random() * 6) * 10, // 30 to 80
      voiceCallChargePerMinute: 20 + Math.floor(Math.random() * 4) * 10, // 20 to 50
      offlineVisitingFee: 1000 + Math.floor(Math.random() * 5) * 500, // 1000 to 3000
      practiceAreas,
      topCourtPractised,
      profilePhotoUrl
    });
  }

  const advocates = [];
  for (const data of advocatesData) {
    const adv = await prisma.advocate.create({
      data: {
        ...data,
        approvalStatus: 'APPROVED',
        approvedAt: new Date()
      }
    });
    advocates.push(adv);
  }
  console.log(`Seeded ${advocates.length} advocates successfully.`);

  // 4. Seed Reviews & Calculate Ratings
  console.log('Seeding reviews...');
  const reviewsData = [];

  // Static reviews for first 7 advocates (to achieve target ratings of 4.3, 4.5, 4.0, 4.7, 5.0, 4.1, 4.9)
  const staticReviews = [
    // Rajesh Sharma: 5, 4, 4 -> 4.333... -> 4.3
    { userId: users[0].id, advocateId: advocates[0].id, rating: 5, reviewText: 'Advocate Rajesh is extremely knowledgeable and professional. He handled our family bail application with utmost diligence and secured the bail in record time. Highly recommended!' },
    { userId: users[1].id, advocateId: advocates[0].id, rating: 4, reviewText: 'Very experienced lawyer. Answered all my criminal litigation queries clearly. The fees are high but worth the professional expertise.' },
    { userId: users[2].id, advocateId: advocates[0].id, rating: 4, reviewText: 'Knowledgeable and helpful.' },

    // Priya Patel: 5, 5, 4, 4 -> 4.5
    { userId: users[0].id, advocateId: advocates[1].id, rating: 5, reviewText: 'Excellent corporate legal consultant. She reviewed our term sheets and shareholder agreements thoroughly. Great for tech startups.' },
    { userId: users[1].id, advocateId: advocates[1].id, rating: 5, reviewText: 'Priya helped us register our trademark and patent files. Her advice was prompt and clear.' },
    { userId: users[2].id, advocateId: advocates[1].id, rating: 4, reviewText: 'Detailed contract review.' },
    { userId: users[3].id, advocateId: advocates[1].id, rating: 4, reviewText: 'Very professional interaction.' },

    // Amit Verma: 4, 4, 4 -> 4.0
    { userId: users[0].id, advocateId: advocates[2].id, rating: 4, reviewText: 'Amit helped resolving a property dispute with our tenant. Good knowledge of local RERA rules.' },
    { userId: users[1].id, advocateId: advocates[2].id, rating: 4, reviewText: 'Good legal consultation.' },
    { userId: users[2].id, advocateId: advocates[2].id, rating: 4, reviewText: 'Helped resolve our real estate issues.' },

    // Sneha Iyer: 5, 4, 5 -> 4.666... -> 4.7
    { userId: users[0].id, advocateId: advocates[3].id, rating: 5, reviewText: 'Sneha was incredibly compassionate and logical during a stressful child custody dispute. Excellent family court advocacy.' },
    { userId: users[1].id, advocateId: advocates[3].id, rating: 4, reviewText: 'Highly supportive lawyer. Handled my mutual divorce proceedings smoothly.' },
    { userId: users[2].id, advocateId: advocates[3].id, rating: 5, reviewText: 'Very compassionate and professional.' },

    // Vikram Singh: 5, 5, 5 -> 5.0
    { userId: users[0].id, advocateId: advocates[4].id, rating: 5, reviewText: 'Superb taxation advice. Solved a complicated corporate tax audit problem easily.' },
    { userId: users[1].id, advocateId: advocates[4].id, rating: 5, reviewText: 'Highly recommended for direct tax issues.' },
    { userId: users[2].id, advocateId: advocates[4].id, rating: 5, reviewText: 'Brilliant representation in tax tribunal.' },

    // Meera Nair: 5, 4, 4, 4, 4, 4, 4, 4, 4, 4 -> 4.1
    { userId: users[0].id, advocateId: advocates[5].id, rating: 5, reviewText: 'A dedicated environmental advocate fighting for sustainable industrial development.' },
    { userId: users[1].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Good feedback and solid presence.' },
    { userId: users[2].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Helpful consultation on land usage.' },
    { userId: users[3].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Responsive' },
    { userId: users[4].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Professional approach' },
    { userId: users[5].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Good advice' },
    { userId: users[6].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Satisfactory service' },
    { userId: users[7].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Solid litigation lawyer' },
    { userId: users[8].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Nice behavior' },
    { userId: users[9].id, advocateId: advocates[5].id, rating: 4, reviewText: 'Very clear explanation' },

    // Generated Advocate 0 (advocates[6]): 5, 5, 5, 5, 5, 5, 5, 5, 5, 4 -> 4.9
    { userId: users[0].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Highly recommended' },
    { userId: users[1].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Excellent representation' },
    { userId: users[2].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Great results' },
    { userId: users[3].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Fantastic support' },
    { userId: users[4].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Professional client care' },
    { userId: users[5].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Brilliant knowledge' },
    { userId: users[6].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Outstanding skills' },
    { userId: users[7].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Top notch legal assistance' },
    { userId: users[8].id, advocateId: advocates[6].id, rating: 5, reviewText: 'Very reliable' },
    { userId: users[9].id, advocateId: advocates[6].id, rating: 4, reviewText: 'A minor delay but excellent work overall' }
  ];

  reviewsData.push(...staticReviews);

  // Let's add some reviews for the generated advocates as well
  const reviewComments = [
    'Great experience consulting this lawyer. Guided me step by step through the legal process.',
    'Highly professional and punctual. Resolved my issue efficiently.',
    'Clear and precise consultation. Fees were reasonable for the expertise offered.',
    'Very helpful advice on short notice. Would recommend to others.',
    'Helpful, but a bit hard to reach over phone. Good legal knowledge though.',
    'Superb experience. Detail-oriented planning and solid defense/representation.'
  ];

  // For each remaining advocate, check if reviews already added. If not, add reviews from a random subset of users
  for (const adv of advocates) {
    const exists = reviewsData.some(r => r.advocateId === adv.id);
    if (!exists) {
      const numReviews = 1 + Math.floor(Math.random() * 6);
      const shuffledUsers = [...users].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numReviews; j++) {
        const user = shuffledUsers[j];
        const rating = 3 + Math.floor(Math.random() * 3); // 3 to 5 stars
        const reviewText = reviewComments[Math.floor(Math.random() * reviewComments.length)];
        reviewsData.push({
          userId: user.id,
          advocateId: adv.id,
          rating,
          reviewText
        });
      }
    }
  }

  for (const r of reviewsData) {
    await prisma.review.create({ data: r });
  }
  console.log(`Seeded ${reviewsData.length} reviews successfully.`);

  // 5. Update Advocates' ratings and review count based on reviews
  console.log('Updating advocate rating summaries...');
  for (const adv of advocates) {
    const dbReviews = await prisma.review.findMany({
      where: { advocateId: adv.id }
    });

    if (dbReviews.length > 0) {
      const totalReviews = dbReviews.length;
      const sumRating = dbReviews.reduce((acc, curr) => acc + curr.rating, 0);
      const averageRating = Math.round((sumRating / totalReviews) * 10) / 10;

      await prisma.advocate.update({
        where: { id: adv.id },
        data: {
          averageRating: averageRating,
          totalReviews: totalReviews
        }
      });
      console.log(`Updated rating for ${adv.fullName}: Avg: ${averageRating.toFixed(1)}, Count: ${totalReviews}`);
    } else {
      await prisma.advocate.update({
        where: { id: adv.id },
        data: {
          averageRating: null,
          totalReviews: 0
        }
      });
    }
  }

  // Idempotent Seeding of Admin
  const adminEmail = 'it2@techvunex.in';
  let admin = await prisma.admin.findUnique({
    where: { email: adminEmail }
  });

  if (!admin) {
    console.log('Seeding Admin...');
    const adminPasswordHash = await bcrypt.hash('123456', 10);
    admin = await prisma.admin.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        fullName: 'System Admin'
      }
    });
    console.log('Admin seeded successfully.');
  } else {
    console.log('Admin already exists.');
  }

  // Idempotent Seeding of Content Creator
  const creatorEmail = 'trainee6@techvunex.in';
  let creator = await prisma.contentCreator.findUnique({
    where: { email: creatorEmail }
  });

  if (!creator) {
    console.log('Seeding Content Creator...');
    const creatorPasswordHash = await bcrypt.hash('1234', 10);
    creator = await prisma.contentCreator.create({
      data: {
        email: creatorEmail,
        passwordHash: creatorPasswordHash,
        fullName: 'Techvunex Legal Content Team',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60',
        bio: 'Legal content creator focused on simplifying Indian legal information and making legal knowledge easier to understand.'
      }
    });
    console.log('Content Creator seeded successfully.');
  } else {
    console.log('Content Creator already exists. Ensuring profile details are populated...');
    if (creator.fullName === 'Content Creator' || !creator.image || !creator.bio) {
      creator = await prisma.contentCreator.update({
        where: { email: creatorEmail },
        data: {
          fullName: 'Techvunex Legal Content Team',
          image: creator.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60',
          bio: creator.bio || 'Legal content creator focused on simplifying Indian legal information and making legal knowledge easier to understand.'
        }
      });
      console.log('Content Creator profile details updated.');
    }
  }

  // Idempotent Seeding of Blogs (clean up blogs written by mock creator to prevent duplicates on rerun)
  console.log('Cleaning up existing mock blogs...');
  await prisma.blog.deleteMany({
    where: { authorId: creator.id }
  });

  console.log('Seeding 15 mock blogs...');
  const mockBlogs = [
    {
      heading: 'Constitutional Law',
      title: 'Fundamental Rights in India',
      slug: 'fundamental-rights-in-india',
      date: new Date('2026-08-01'),
      writtenBy: creator.fullName,
      content: 'Fundamental Rights are a set of basic rights guaranteed to all citizens of India by the Constitution. These rights are essential for the personal, moral, and spiritual development of citizens. They are justiciable, meaning they can be enforced in court if violated. The six fundamental rights are: Right to Equality, Right to Freedom, Right against Exploitation, Right to Freedom of Religion, Cultural and Educational Rights, and Right to Constitutional Remedies.',
      metaTitle: 'Fundamental Rights in India | Constitutional Guide',
      metaDescription: 'An introduction to the six fundamental rights guaranteed by the Indian Constitution, their importance, and legal remedies.',
      metaKeywords: 'Fundamental Rights, Indian Constitution, legal rights, justice, Right to Equality',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Criminal Law',
      title: 'Understanding Bail Laws in India',
      slug: 'understanding-bail-laws-in-india',
      date: new Date('2026-08-02'),
      writtenBy: creator.fullName,
      content: 'Bail is the temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is lodged to guarantee their appearance in court. In India, offenses are classified into bailable and non-bailable. For bailable offenses, bail is a matter of right. For non-bailable offenses, bail is a matter of court discretion, guided by principles of justice and the likelihood of the accused fleeing or tampering with evidence.',
      metaTitle: 'Understanding Bail Laws in India | Legal Guide',
      metaDescription: 'Learn about bail laws in India, different types of bail, eligibility, and the legal process explained in simple language.',
      metaKeywords: 'bail laws India, bail process, legal rights, Indian law, advocate',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Criminal Procedure',
      title: 'What Is an FIR?',
      slug: 'what-is-an-fir',
      date: new Date('2026-08-03'),
      writtenBy: creator.fullName,
      content: 'First Information Report (FIR) is a document prepared by police when they receive information about the commission of a cognizable offense. It is the first step in the criminal justice process and initiates the investigation. Anyone who knows about a cognizable offense can file an FIR at a police station. It is crucial to file it as soon as possible after the incident to ensure evidence is fresh.',
      metaTitle: 'What Is an FIR? | Criminal Procedure Guide',
      metaDescription: 'Understand the legal significance of a First Information Report (FIR), how to file one, and your rights if police refuse to register it.',
      metaKeywords: 'FIR, First Information Report, police investigation, Indian police, legal guide',
      image: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Consumer Law',
      title: 'How to File a Consumer Complaint',
      slug: 'how-to-file-a-consumer-complaint',
      date: new Date('2026-08-04'),
      writtenBy: creator.fullName,
      content: 'Under the Consumer Protection Act, 2019, consumer forums are established at district, state, and national levels to resolve consumer disputes. If a consumer has bought defective goods or experienced deficient service, they can file a complaint. The process involves sending a legal notice first. If the vendor does not resolve the issue, a formal complaint can be filed in the appropriate consumer court.',
      metaTitle: 'How to File a Consumer Complaint | Consumer Rights',
      metaDescription: 'A step-by-step guide to filing a consumer complaint in India, including sending notices and consumer court jurisdiction.',
      metaKeywords: 'consumer court, consumer rights, filing complaint, Consumer Protection Act, legal help',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Criminal Law',
      title: 'Rights of an Accused Person',
      slug: 'rights-of-an-accused-person',
      date: new Date('2026-08-05'),
      writtenBy: creator.fullName,
      content: 'The Indian Constitution and criminal procedure codes protect the rights of accused persons to ensure a fair trial. Key rights include the Right to Silence (protection against self-incrimination), Right to know the grounds of arrest, Right to consult a lawyer, Right to be produced before a magistrate within 24 hours of arrest, and Right to legal aid if indigent.',
      metaTitle: 'Rights of an Accused Person | Criminal Defense',
      metaDescription: 'Discover the constitutional and statutory rights of an accused person under arrest in India to ensure a fair legal process.',
      metaKeywords: 'accused rights, arrest rules, fair trial, legal defense, Indian law',
      image: 'https://images.unsplash.com/photo-1505664194779-8bebcb95c024?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Property Law',
      title: 'Understanding Property Rights',
      slug: 'understanding-property-rights',
      date: new Date('2026-08-06'),
      writtenBy: creator.fullName,
      content: 'Property rights in India have evolved from being a fundamental right to a constitutional right under Article 300A. The state cannot deprive a person of their property except by authority of law. Understanding property transfers, registration, inheritance, and mutations is critical for securing ownership and preventing real estate disputes.',
      metaTitle: 'Understanding Property Rights in India | Property Law',
      metaDescription: 'An overview of property ownership, title checks, transfer laws, and Article 300A rights under Indian property law.',
      metaKeywords: 'property rights, RERA, land transfer, real estate, ownership inheritance',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Legal Procedure',
      title: 'What Is a Legal Notice?',
      slug: 'what-is-a-legal-notice',
      date: new Date('2026-08-07'),
      writtenBy: creator.fullName,
      content: 'A legal notice is a formal communication sent by one party to another, informing them of an intention to initiate legal proceedings if certain demands are not met. It is an opportunity to settle disputes amicably without going to court. Serving a legal notice is mandatory in several civil cases, including consumer complaints and property evictions.',
      metaTitle: 'What Is a Legal Notice? | Civil Litigation Guide',
      metaDescription: 'Learn about the purpose, layout, and legal implications of sending or receiving a formal legal notice in civil disputes.',
      metaKeywords: 'legal notice, dispute resolution, civil law, formal warning, court case',
      image: 'https://images.unsplash.com/photo-1505664063603-23e56228b36e?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Cyber Law',
      title: 'Cyber Crime and Legal Protection',
      slug: 'cyber-crime-and-legal-protection',
      date: new Date('2026-08-08'),
      writtenBy: creator.fullName,
      content: 'With rapid digitalization, cyber crime (identity theft, online fraud, cyber stalking, hacking) has risen. The Information Technology Act, 2000, along with the Indian Penal Code, provides legal frameworks to address and prosecute cyber criminals. Reporting cyber crimes through official portals is key to securing remedy and recovering financial losses.',
      metaTitle: 'Cyber Crime and Legal Protection | Cyber Law India',
      metaDescription: 'Explore the IT Act provisions, common cyber crimes, and steps to register complaints with cyber cell departments.',
      metaKeywords: 'cyber crime, IT Act, online fraud, cyber cell, legal protection',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Women and Law',
      title: "Women's Legal Rights in India",
      slug: 'women-s-legal-rights-in-india',
      date: new Date('2026-08-09'),
      writtenBy: creator.fullName,
      content: "Women's legal rights in India span across constitutional protections, family law, criminal law protections, and employment benefits. Specific protections include the Domestic Violence Act, Maternity Benefit Act, POSH Act (sexual harassment at workplace), Equal Remuneration Act, and rights regarding equal inheritance of family property.",
      metaTitle: "Women's Legal Rights in India | Gender Equality Guide",
      metaDescription: 'A comprehensive summary of Indian legal provisions protecting women at home, in marriage, and at workplaces.',
      metaKeywords: 'womens rights, POSH Act, domestic violence, equal pay, inheritance law',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Rental Law',
      title: 'Tenant Rights and Rental Disputes',
      slug: 'tenant-rights-and-rental-disputes',
      date: new Date('2026-08-10'),
      writtenBy: creator.fullName,
      content: 'Rent control laws in various states govern the relationship between landlords and tenants. Tenant rights include protection against arbitrary eviction, right to essential services (water, electricity), and fair rent determinations. Landlords must follow strict procedures, including sending eviction notices, before recovering possession.',
      metaTitle: 'Tenant Rights and Rental Disputes | Rent Control Laws',
      metaDescription: 'Understand tenant rights, rental agreements, security deposits, and how to resolve disputes with landlords legally.',
      metaKeywords: 'tenant rights, rental agreement, eviction laws, rent control, landlord dispute',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Alternative Dispute Resolution',
      title: 'How Mediation Works',
      slug: 'how-mediation-works',
      date: new Date('2026-08-11'),
      writtenBy: creator.fullName,
      content: 'Mediation is a structured, voluntary negotiation process where a neutral third party (mediator) helps disputing parties reach a mutually agreeable settlement. It is faster, cheaper, and more confidential than litigation. Courts in India frequently refer civil, commercial, and matrimonial disputes to mediation centres under Section 89 of CPC.',
      metaTitle: 'How Mediation Works | ADR and Dispute Resolution',
      metaDescription: 'An introduction to mediation processes, court-annexed mediation, and benefits of settling cases out of court.',
      metaKeywords: 'mediation, ADR, arbitration, court settlement, out of court agreement',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Civil Litigation',
      title: 'Understanding Criminal and Civil Cases',
      slug: 'understanding-criminal-and-civil-cases',
      date: new Date('2026-08-12'),
      writtenBy: creator.fullName,
      content: 'Legal cases in India are divided into civil and criminal. Civil cases involve disputes between individuals or organizations over rights, contracts, or property (e.g., breach of contract, divorce). Criminal cases involve acts against state/society (e.g., theft, assault) prosecuted by the state. Civil cases seek compensation, while criminal cases seek punishment.',
      metaTitle: 'Understanding Criminal and Civil Cases | Law Basics',
      metaDescription: 'Learn to distinguish between civil and criminal cases in India, their court procedures, and legal remedies.',
      metaKeywords: 'civil case, criminal law, court dispute, damages, legal basics',
      image: 'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Legal Advice',
      title: 'How to Find the Right Advocate',
      slug: 'how-to-find-the-right-advocate',
      date: new Date('2026-08-13'),
      writtenBy: creator.fullName,
      content: 'Finding the right advocate is critical for the outcome of any legal dispute. Important factors to consider include the advocate’s specialization, experience years, court of practice, average ratings/reviews from other clients, and communication transparency. The digital age makes checking bar credentials and online consultations very convenient.',
      metaTitle: 'How to Find the Right Advocate | Legal Consultations',
      metaDescription: 'A guide to choosing the best lawyer for your specific legal case, checking bar counsel registrations, and consulting fees.',
      metaKeywords: 'find lawyer, hire advocate, legal advice, Bar Council, attorney review',
      image: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Senior Citizens',
      title: 'Legal Rights of Senior Citizens',
      slug: 'legal-rights-of-senior-citizens',
      date: new Date('2026-08-14'),
      writtenBy: creator.fullName,
      content: 'The Maintenance and Welfare of Parents and Senior Citizens Act, 2007, makes it a legal obligation for children to maintain their parents. It establishes tribunals where parents can claim maintenance. Additionally, senior citizens enjoy special tax exemptions, banking benefits, and priority hearing of cases in Indian courts.',
      metaTitle: 'Legal Rights of Senior Citizens | Maintenance Act',
      metaDescription: 'Read about the Maintenance Act, legal rights of parents, and benefits provided to senior citizens in India.',
      metaKeywords: 'senior citizen rights, Maintenance Act, parental support, old age protection',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    },
    {
      heading: 'Constitutional History',
      title: 'Understanding the Indian Constitution',
      slug: 'understanding-the-indian-constitution',
      date: new Date('2026-08-15'),
      writtenBy: creator.fullName,
      content: 'The Constitution of India is the supreme law of the land, adopted on 26th January 1950. It establishes a federal structure with unitary features, defining powers of the legislative, executive, and judicial branches. It contains directive principles, state structures, federal divisions, and sets the baseline for all statutory legislation.',
      metaTitle: 'Understanding the Indian Constitution | Legal History',
      metaDescription: 'A fundamental introduction to the drafting, structure, preamble, and key pillars of the Indian Constitution.',
      metaKeywords: 'Indian Constitution, supreme law, drafting committee, legal democracy',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=60',
      authorId: creator.id
    }
  ];

  for (const b of mockBlogs) {
    await prisma.blog.create({ data: b });
  }

  // Idempotent Seeding of User Rights
  console.log('Seeding initial User Rights (idempotent with detailed ~500-word content)...');
  const initialUserRights = [
    {
      title: 'Children Rights',
      description: `## Overview

Children represent one of the most vulnerable groups in society and are entitled to special legal protections, care, and guidance. The legal framework establishes fundamental safeguards to ensure that every child can grow up in a safe, healthy, and nurturing environment free from harm, neglect, and exploitation.

## Right to Education

Every child has a fundamental right to free and compulsory elementary education. The law mandates that children between the ages of six and fourteen years are entitled to formal schooling without financial barriers. Educational institutions are expected to maintain inclusive classrooms, provide basic infrastructure, and ensure that no child is subjected to physical punishment or mental harassment.

## Right to Protection From Abuse and Exploitation

Children are legally shielded from all forms of physical, emotional, and sexual abuse. Strict legal frameworks establish zero tolerance for offenses against children, mandating child-friendly investigation procedures, mandatory reporting by professionals, and in-camera trial proceedings to safeguard the child's identity and psychological well-being. Exploitation, trafficking, and abandonment are serious criminal offenses.

## Right to Health and Development

Every child has the inherent right to standard healthcare, balanced nutrition, clean drinking water, and immunization. Healthcare providers and public health programs are designed to reduce infant mortality, treat childhood illnesses, and support physical as well as cognitive development throughout developmental stages.

## Right to Identity and Dignity

From birth, every child possesses the legal right to a registered name, nationality, and legal identity. Birth registration serves as an essential foundation for accessing public entitlements, education, healthcare, and inheritance rights. Children are also entitled to personal dignity, respectful treatment, and consideration of their best interests in all administrative and judicial decisions concerning their custody or welfare.

## Protection Against Child Labour

Child labor laws strictly prohibit the employment of children in hazardous occupations and processes, while regulating general employment conditions for adolescents. The objective is to prevent premature entry into the workforce that disrupts schooling, damages physical health, or impedes overall mental growth.

## Right to Voice and Participation

Children capable of forming their own views have the right to express their opinions freely in all matters affecting them, with appropriate weight given to their age and maturity in family, school, and legal proceedings.

## What Parents and Guardians Should Know

Parents and legal guardians bear the primary responsibility for the upbringing, safety, and moral care of their children. While guardians have decision-making authority, the law prioritizes the paramount welfare and best interest of the child. Neglect, severe mistreatment, or failure to provide basic necessities can lead to legal intervention and protective custody.

## Where to Seek Help

In cases involving child distress, abuse, neglect, or missing children, citizens can reach out to dedicated child helplines (such as national emergency child services), Child Welfare Committees (CWCs), District Child Protection Units, or local law enforcement authorities.

## Important Note

Applicable rights, institutional procedures, and welfare schemes may vary depending on local jurisdictions and specific circumstances. This information is intended for educational purposes and does not constitute formal legal advice.`,
      photo: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&auto=format&fit=crop&q=80',
      createdBy: creator.id
    },
    {
      title: 'Consumer Rights',
      description: `## Overview

Consumer rights form the backbone of modern commercial fairness, protecting individuals when purchasing goods or availing services. Legal statutes establish clear standards to balance the relationship between consumers and commercial enterprises, ensuring accountability, transparency, and product reliability.

## Right to Safety

Consumers have the right to be protected against the marketing of goods and delivery of services that are hazardous to life and property. Manufactured products, electrical appliances, pharmaceuticals, and packaged foods must adhere to established safety standards and undergo mandatory quality testing before reaching the marketplace.

## Right to Information

Consumers are legally entitled to receive accurate information regarding the quality, quantity, potency, purity, standard, and price of goods or services. This right obligates manufacturers and sellers to provide comprehensive labeling, including manufacturing dates, expiry dates, ingredient lists, maximum retail prices (MRP), and appropriate warning labels.

## Right to Choose

Consumers have the right to be assured of access to a variety of goods and services at competitive prices. Monopolistic practices, forced bundling of unwanted products, and artificial market restrictions that limit consumer choice are prohibited under fair trade principles.

## Right to Be Heard

Consumers have the right to voice their grievances and receive due consideration in appropriate forums. Businesses are encouraged to maintain responsive consumer care channels, while consumer protection bodies represent consumer interests in policy formulation and dispute resolution.

## Right to Seek Redressal

When a consumer suffers damage or loss due to defective goods, deficient services, or fraudulent trade behavior, they are entitled to seek legal redressal. Redressal remedies include product repair, complete replacement, price refund, and compensation for financial loss or mental harassment.

## Protection Against Unfair Trade Practices

Unfair trade practices, such as deceptive advertising, false claims regarding product performance, hoarding, selling counterfeit items, and refusal to issue proper receipts, are strictly prohibited under consumer protection legislation.

## Misleading Advertisements and Endorsements

Manufacturers, advertisers, and celebrity endorsers face strict liability for unsubstantiated claims or misleading endorsements. Regulatory authorities can impose penalties and order corrective advertisements when promotional campaigns misrepresent product efficacy, safety, or nutritional benefits.

## Online Shopping and Digital Transactions

In e-commerce, consumers enjoy enhanced protections regarding transparent return policies, accurate product representations, delivery timelines, secure payment gateways, and explicit disclosure of seller identities and grievance officer details.

## How Consumers Can Raise a Complaint

Consumers experiencing unresolved issues should first send a formal notice or written complaint to the merchant or service provider. If the issue remains unresolved, complaints can be lodged before appropriate consumer commissions (district, state, or national) or through official national consumer helplines and digital portals.

## Important Note

Specific remedies, jurisdictional limits, and statutory limitation periods depend on the value of goods and the nature of the transaction. This content is for general informational awareness and does not replace personalized legal counsel.`,
      photo: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80',
      createdBy: creator.id
    },
    {
      title: 'Tenant Rights',
      description: `## Overview

Tenant rights protect individuals and families renting residential or commercial properties. A fair tenancy framework balances the legitimate ownership rights of property owners with the security, dignity, and peaceful possession of occupants.

## Rental Agreement

A comprehensive written rental agreement is the most critical document in any tenancy. The agreement outlines vital terms including the monthly rent, payment due dates, duration of lease, renewal clauses, security deposit amount, and specific usage restrictions. Registering or properly executing the tenancy contract ensures clarity and legal enforceability for both parties.

## Rent and Security Deposit

Landlords are entitled to receive agreed-upon rent in a timely manner and may collect a reasonable security deposit at the commencement of the lease. Tenants have the right to receive formal rent receipts. Security deposits must be refunded upon lawful vacation of the property, subject only to legitimate deductions for unpaid dues or actual damages beyond ordinary wear and tear.

## Privacy and Peaceful Possession

Once a property is leased, the tenant holds the right to quiet enjoyment and peaceful possession. Landlords cannot enter the rented premises arbitrarily without prior reasonable notice, except during genuine emergencies. Harassment, unauthorized intrusion, or intimidation by the property owner violates basic tenancy protections.

## Repairs and Maintenance

Generally, structural repairs, major plumbing overhauls, and external maintenance remain the responsibility of the landlord, while routine day-to-day upkeep is managed by the tenant. Essential utilities, including uninterrupted water supply, electricity connections, and sanitary services, cannot be disconnected or withheld by the landlord to exert pressure.

## Notice and Eviction

Tenants cannot be arbitrarily or forcibly evicted without due process of law. Landlords must provide formal written notice with adequate time as specified in the rental agreement or statutory regulations. Eviction grounds typically require legitimate reasons such as non-payment of rent, substantial breach of agreement terms, or bona fide personal requirement.

## Unfair Deductions and Deposit Refunds

At the conclusion of the lease, property inspections must be conducted jointly. Landlords cannot make arbitrary deductions for regular repainting or aging fixtures unless expressly negotiated. Unreasonable delays in returning security deposits may entitle tenants to statutory interest or dispute compensation.

## Landlord and Tenant Responsibilities

Tenants must maintain the premises responsibly, refrain from causing structural alterations without consent, avoid unlawful activities, and pay utility bills as agreed. Landlords must deliver habitable premises that meet basic safety and hygiene standards.

## Common Tenant Disputes

Frequent disputes involve security deposit withholding, unexpected rent hikes, delayed repairs, and early termination conflicts. Retaining copies of contracts, payment proofs, and photographic condition records helps resolve disagreements quickly.

## Where to Seek Legal Help

Tenants facing unlawful eviction or utility disconnections can approach Rent Authorities, Rent Tribunals, civil courts, or local mediation centers depending on applicable tenancy legislation.

## Important Note

Tenancy regulations and rent control acts differ substantially across states and union territories. Applicable procedures depend on state-specific laws and the executed contract. This information is educational and not individual legal advice.`,
      photo: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80',
      createdBy: creator.id
    },
    {
      title: 'Employee Rights',
      description: `## Overview

Employee rights establish the foundational standards for dignity, fairness, and safety in the workplace. Employment regulations aim to protect workers from exploitation, promote equitable compensation, and ensure healthy occupational environments across diverse industrial, corporate, and informal sectors.

## Wages and Payment

Employees are legally entitled to receive timely payment of wages without unauthorized deductions. Minimum wage regulations prescribe baseline compensation levels across different industries and skill categories. Additionally, statutory frameworks govern entitlements such as overtime compensation, annual bonuses, gratuity, and provident fund contributions where applicable.

## Working Conditions

Employers are obligated to provide a humane, clean, and well-ventilated working environment. Basic amenities, including access to clean drinking water, adequate sanitary facilities, first aid supplies, and ergonomic work arrangements, are fundamental expectations under occupational health standards.

## Workplace Safety

Workplace safety regulations require employers to identify occupational hazards, maintain machinery, implement protective measures, and supply personal protective equipment (PPE) in hazardous operations. In the unfortunate event of work-related injury or accident, employees or their dependents have the right to statutory compensation.

## Working Hours and Leave

Labor laws regulate standard daily and weekly working hours, mandatory rest intervals, and weekly rest days. Employees are entitled to various categories of leave, including earned leave, casual leave, sick leave, and paid statutory festival holidays. Female employees are entitled to comprehensive maternity benefits, including paid leave and nursing breaks.

## Equality and Non-Discrimination

Every worker is entitled to equal treatment and fair opportunity. Discrimination in hiring, remuneration, promotions, or working conditions based on gender, religion, caste, race, or disability is strictly prohibited. Equal pay for equal work remains an established legal principle.

## Protection Against Workplace Harassment

Workplaces must maintain zero tolerance for sexual harassment and abusive behavior. Organizations employing ten or more individuals are legally required to constitute Internal Committees (IC) to address complaints impartially, confidentially, and expeditiously through structured inquiry mechanisms.

## Termination, Notice Periods, and Retrenchment

Employers cannot terminate employment arbitrarily without adhering to contractual notice periods or providing statutory severance compensation in retrenchment situations. Employees terminated without lawful cause or natural justice principles are entitled to contest unfair dismissals before statutory labor courts.

## Employment Records

Workers are entitled to formal documentation, including appointment letters, wage slips, attendance records, and experience certificates upon separation. Clear documentation helps prevent disputes regarding employment terms, tenure, and benefits.

## What an Employee Can Do

Employees facing wage non-payment, wrongful termination, or safety violations should preserve employment records, communications, and pay slips. Grievances can be raised through internal HR channels, trade unions, labor conciliation officers, or specialized labor tribunals.

## Important Note

Employment rights, statutory thresholds, and dispute forums vary significantly depending on job roles, establishment size, contract terms, and whether the employee is categorized as a workman or managerial staff. This content is for general educational reference only.`,
      photo: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&auto=format&fit=crop&q=80',
      createdBy: creator.id
    },
    {
      title: 'Women Rights',
      description: `## Overview

Women's rights are rooted in principles of equality, dignity, personal safety, and social justice. Legal frameworks encompass constitutional guarantees and specialized statutory protections designed to eliminate gender discrimination, prevent violence, and support female empowerment across personal, domestic, and professional spheres.

## Right to Equality

Women are guaranteed equal rights under the law and protection against state-sponsored or institutional discrimination. The legal system actively promotes affirmative measures, educational initiatives, and welfare programs to advance gender parity and socioeconomic participation.

## Protection From Violence

Comprehensive legal mechanisms protect women against domestic violence, physical assault, emotional cruelty, dowry harassment, stalking, and sexual offenses. Domestic violence laws provide multi-faceted civil remedies, including protection orders against abusers, residence orders securing the right to live in the shared household, monetary relief, and temporary child custody.

## Protection Against Workplace Harassment

Legislation on the prevention of sexual harassment at the workplace ensures safe professional environments. Organizations are mandated to establish internal redressal committees, conduct gender-sensitization workshops, maintain confidential complaint registers, and complete inquiries within statutory timelines.

## Rights in the Workplace

Women are entitled to equal remuneration for identical work and non-discriminatory hiring and promotion opportunities. Working mothers are protected by extensive maternity benefit laws, which provide paid maternity leave, job security during pregnancy, medical bonuses, and mandatory crèche facilities in qualifying commercial establishments.

## Childcare and Health Protections

In addition to paid leave, female employees returning from maternity leave are entitled to nursing breaks during working hours. Establishments with qualifying staff numbers are legally mandated to maintain crèche facilities within accessible distances, ensuring mothers can balance professional duties with infant care.

## Rights Relating to Marriage and Family

Family law provides women with vital protections concerning consensual marriage, maintenance rights during separation, divorce remedies, and custody considerations prioritizing the child's welfare. Women are entitled to financial maintenance and alimony to sustain a life of dignity following marital dissolution.

## Property and Financial Rights

Women enjoy equal coparcenary rights in ancestral property and full ownership rights over self-acquired or inherited assets. Additionally, 'Stridhan'—comprising gifts, jewelry, and property received before, during, or after marriage—remains the exclusive absolute property of the woman, and she retains the unrestricted right to its possession and management.

## Access to Legal Protection

Women are entitled to free legal aid services through State and National Legal Services Authorities. Criminal procedure rules provide specific protections during investigations, such as recording statements by female officers, avoiding arrest after sunset without special judicial authorization, and medical examinations conducted only by female practitioners.

## Where to Seek Help

Women experiencing distress, violence, or legal denial can contact dedicated national women helplines (such as 1091 or 181), National and State Commissions for Women, One-Stop Crisis Centers, or Protection Officers appointed under domestic violence legislation.

## Important Note

Specific family laws and inheritance codes may vary based on religious and personal laws. This material provides general educational knowledge and does not constitute formal legal counsel.`,
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
      createdBy: creator.id
    },
    {
      title: 'Digital and Privacy Rights',
      description: `## Overview

In an increasingly interconnected digital world, privacy and personal autonomy are recognized as fundamental aspects of human dignity. Digital and privacy rights encompass the legal standards, protocols, and individual entitlements that protect personal information, online communications, and digital identities from unauthorized exploitation or surveillance.

## Right to Privacy

Privacy is recognized as an intrinsic fundamental right under constitutional jurisprudence. It safeguards individual decisional autonomy, bodily integrity, spatial privacy, and informational privacy. The state and private entities must demonstrate legality, necessity, and proportionality when accessing or processing private individual data.

## Personal Data

Personal data includes any information that can identify an individual, such as names, identification numbers, addresses, contact details, biometric information, financial credentials, and health records. Because of its sensitive nature, handling personal data requires heightened standards of care, security, and institutional confidentiality.

## Consent and Data Handling

Data processing entities must adhere to core data protection principles. Data should be collected solely for specified, lawful purposes and with the informed consent of the individual. Users are entitled to clear notice regarding what data is gathered, how long it will be retained, and with whom it may be shared. Individuals generally retain rights to access, correct, update, or request erasure of their personal data.

## Online Safety

Digital users have the right to be protected against online harassment, cyber stalking, non-consensual sharing of intimate images, identity theft, and impersonation. Digital security frameworks mandate quick takedown mechanisms and criminal liability for perpetrators of digital harassment.

## Protection of Children in the Digital Space

Stricter standards apply to the processing of personal data belonging to minors. Digital platforms and service providers are prohibited from tracking, behavioral profiling, or serving targeted advertisements to children that could compromise their mental well-being or physical safety.

## Protection Against Unauthorized Access

Unauthorized access to computer systems, data theft, hacking, spreading malware, and interception of electronic communications are prohibited by cyber law. Organizations maintaining digital infrastructure are legally obligated to implement reasonable security practices to prevent data breaches.

## Digital Transactions

Consumers engaging in online banking and e-commerce transactions are protected by financial security standards. Financial institutions must implement multi-factor authentication, transaction alerts, and transparent dispute-resolution mechanisms for unauthorized digital debits.

## Social Media and Online Platforms

Online intermediaries and social media platforms must publish terms of service, maintain user grievance mechanisms, appoint grievance officers, and act promptly on court or government orders regarding unlawful content.

## What to Do When Privacy Is Violated

If personal data is compromised or online harassment occurs, individuals should preserve digital evidence (such as screenshots, transaction logs, and URLs), report the incident to platform grievance officers, file a complaint on national cybercrime portals, and notify relevant banking or data protection authorities.

## Important Note

Digital regulations, data fiduciary responsibilities, and procedural remedies evolve continuously through emerging legislation and judicial rulings. This guide serves general educational purposes and does not represent specific legal advice.`,
      photo: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
      createdBy: creator.id
    }
  ];

  let createdRightsCount = 0;
  let updatedRightsCount = 0;

  for (const rightData of initialUserRights) {
    const existing = await prisma.userRight.findFirst({
      where: { title: rightData.title }
    });

    if (!existing) {
      await prisma.userRight.create({
        data: rightData
      });
      createdRightsCount++;
    } else {
      await prisma.userRight.update({
        where: { id: existing.id },
        data: {
          description: rightData.description,
          photo: existing.photo || rightData.photo,
          createdBy: existing.createdBy || rightData.createdBy
        }
      });
      updatedRightsCount++;
    }
  }

  console.log(`User Rights seed finished: ${createdRightsCount} created, ${updatedRightsCount} updated.`);

  // Idempotent Seeding of Guides
  console.log('Seeding initial Guides (idempotent with detailed ~500-word content)...');
  const initialGuides = [
    {
      title: 'How to File a Complaint',
      description: `## Overview

Filing a complaint is the primary formal step taken by an individual or entity to seek redressal for a grievance, report an unlawful act, or initiate regulatory action. Whether addressing a consumer dispute, a criminal offense, a workplace violation, or a deficiency in public service, understanding how to properly document and present your complaint ensures that the appropriate authority can take prompt and effective action.

## 1. Understand the Nature of the Grievance

Before initiating any procedure, clearly determine the nature of the issue:
- **Criminal Matters:** Involving offenses such as theft, physical harm, assault, fraud, cyber harassment, or threats, which must be reported to law enforcement authorities.
- **Consumer Grievances:** Involving defective goods, substandard services, overcharging, or unfair trade practices by commercial sellers or service providers.
- **Civil and Contractual Disputes:** Involving breach of agreements, tenancy disagreements, or property disputes.
- **Administrative and Public Services:** Involving municipal issues, government utility failures, or departmental misconduct, which fall under departmental grievance cells or ombudsmen.

## 2. Collect Supporting Documents and Evidence

A strong complaint relies on verifiable facts and credible documentation. Gather all relevant evidence before drafting:
- Identity and contact proofs of the complainant.
- Chronological timeline of events, noting precise dates, times, and locations.
- Written communications, including emails, letters, text messages, and chat transcripts.
- Financial records such as invoices, payment receipts, bank transfer statements, or contract copies.
- Photographs, audio/video recordings, medical reports, or witness contact details where relevant.

## 3. Identify the Competent Authority

Filing a complaint with the wrong forum causes unnecessary delays. Identify the proper jurisdiction:
- **Police Station / Cyber Cell:** For cognizable criminal offenses or online fraud within the territorial jurisdiction where the incident occurred.
- **Consumer Commissions:** District, State, or National Consumer Disputes Redressal Commissions based on the financial value of the transaction.
- **Internal Grievance Cells / Ombudsmen:** For banking disputes, insurance grievances, telecommunication issues, or workplace harassment committees.
- **Statutory Commissions:** National or State Human Rights Commissions, Women's Commissions, or Child Rights Protection Authorities.

## 4. Draft a Clear and Structured Complaint

When writing the complaint, use polite, objective, and precise language:
- **Heading and Subject:** State the authority addressed and a concise subject line (e.g., "Complaint regarding unauthorized debit and fraudulent transaction").
- **Complainant & Respondent Details:** Provide complete names, addresses, phone numbers, and email IDs of all parties involved.
- **Statement of Facts:** Present the events in chronological order using numbered paragraphs.
- **Specific Relief Sought:** Clearly articulate what outcome you request (e.g., refund, investigation, replacement, or compensation).
- **Declaration:** State that the facts provided are true and correct to the best of your knowledge, followed by your dated signature.

## 5. Submit and Secure an Official Acknowledgement

Submit the complaint through authorized channels (in-person physical submission, registered post, or official government grievance portals). Always obtain a stamped acknowledgement, diary number, or digital reference ID. This reference is crucial for tracking progress and following up on inquiries.

## 6. When to Seek Professional Legal Assistance

While many routine complaints can be filed independently, consulting a qualified advocate is strongly advised when facing complex legal disputes, uncooperative authorities, serious criminal allegations, or when preparing formal court petitions.

## Important Note

Complaint submission procedures, required statutory formats, and appellate mechanisms vary widely based on the subject matter and jurisdiction. This guide provides general educational awareness and does not substitute for personalized legal advice.`,
      createdBy: creator.id
    },
    {
      title: 'How to Send a Legal Notice',
      description: `## Overview

A legal notice is a formal written communication sent by an aggrieved party to an individual or organization, outlining specific grievances, legal rights, and demanded remedies. It serves as a final formal opportunity for the recipient to resolve a dispute amicably before formal litigation is initiated in a court of law or tribunal.

## 1. Purpose and Importance of a Legal Notice

Sending a legal notice serves several critical functions:
- **Formal Communication:** Clearly conveys your intention to initiate legal proceedings if the matter is not resolved.
- **Opportunity for Settlement:** Allows both parties to settle disputes without incurring extensive court fees and trial delays.
- **Creating Documentary Record:** Establishes on the legal record that the recipient was duly informed of their default and given reasonable time to remedy it.
- **Statutory Requirement:** In certain civil and commercial matters (such as specific statutory notices or consumer complaints), serving a prior notice is a required procedural step.

## 2. When Is a Legal Notice Appropriate?

Legal notices are commonly sent in situations such as:
- **Recovery of Money and Non-Payment:** Default on loans, unpaid vendor invoices, or delayed business payments.
- **Property and Tenancy Matters:** Non-payment of rent, unlawful property occupation, breach of lease covenants, or termination of tenancy.
- **Breach of Contract:** Non-fulfillment of agreed commercial terms, delivery failures, or employee agreement breaches.
- **Consumer Grievances:** Deficient services, defective consumer products, or misleading trade advertisements.
- **Employment Disputes:** Wrongful termination, unpaid severance or salaries, and refusal to release relieving letters.

## 3. Gathering Necessary Facts and Documents

Before drafting the notice, assemble all supporting documentation:
- Executed contracts, agreements, or purchase orders.
- Invoices, account statements, payment proofs, and dishonored instrument memos.
- Relevant correspondence including email threads, letters, and SMS/chat records.
- Accurate identification details and official physical/registered addresses of all intended recipients.

## 4. Key Elements of a Well-Drafted Legal Notice

A formal legal notice must be drafted with precision:
- **Identification:** Full legal names, designations, and addresses of both the sender and the recipient.
- **Factual Background:** A chronological statement detailing the relationship between parties, agreed obligations, and the specific breach that occurred.
- **Legal Grounds & Demands:** Clear articulation of the legal basis for the claim and the exact remedy sought (e.g., payment of a specific amount, return of property, or specific performance).
- **Stipulated Notice Period:** A specific, reasonable time window (commonly 15 to 30 days) granted to the recipient to comply or reply.
- **Consequence of Non-Compliance:** A clear declaration that failure to resolve the grievance within the stipulated period will compel the sender to pursue appropriate legal action at the recipient's cost and risk.

## 5. Serving the Notice and Retaining Delivery Proof

A legal notice should be dispatched through legally recognized, verifiable communication channels:
- **Registered Post with Acknowledgement Due (RPAD) or Speed Post:** Provides official postal receipts and delivery tracking reports.
- **Electronic Transmission:** Sending a copy via verified email or electronic messaging alongside physical post provides additional proof of delivery.
- **Preservation of Records:** Safely preserve copies of the signed notice, postal receipts, tracking printouts, and returned acknowledgement cards.

## 6. What Happens After Delivery?

Once the notice is received, the recipient may:
- **Comply with Demands:** Fulfill the requested relief, resolving the dispute amicably.
- **Send a Reply Notice:** Provide their version of facts, dispute claims, or propose negotiated settlement terms.
- **Fail to Respond:** If the recipient ignores the notice within the stipulated timeline, the sender may proceed to file a formal court petition, civil suit, or complaint.

## 7. Working with a Qualified Advocate

While an individual can legally draft a notice on their own behalf, engaging an experienced advocate ensures that the notice accurately references relevant statutory provisions, preserves vital legal rights, and carries professional weight.

## Important Note

A legal notice does not constitute a court judgment or order; it is a pre-litigation communication. Applicable notice periods, statutory formats, and court jurisdictions vary by case type. This guide is for educational reference and does not constitute personalized legal counsel.`,
      createdBy: creator.id
    },
    {
      title: 'How to Find the Right Lawyer',
      description: `## Overview

Selecting the right legal counsel is one of the most critical decisions when facing a legal challenge or planning an important transaction. The legal profession encompasses diverse specialized fields, court hierarchies, and procedural nuances. Finding an advocate with the appropriate experience, communication style, and professional standing helps ensure that your interests are effectively represented.

## 1. Understand Your Specific Legal Needs

The law is vast, and most advocates specialize in distinct practice areas. Identify the core domain of your legal issue:
- **Criminal Law:** Bail applications, criminal trials, cyber offenses, and defense representation.
- **Family & Matrimonial Law:** Divorce proceedings, child custody, maintenance claims, and domestic disputes.
- **Civil & Property Law:** Property title verification, partition suits, tenancy disputes, and injunctions.
- **Corporate & Commercial Law:** Startup incorporation, shareholder agreements, contract drafting, and regulatory compliance.
- **Taxation & Financial Law:** Direct/indirect taxes, GST disputes, and appellate tribunal proceedings.
- **Consumer & Labor Law:** Service deficiencies, consumer forum complaints, and workplace grievances.

## 2. Review Professional Credentials and Experience

When evaluating prospective advocates, consider key indicators of professional competence:
- **Bar Council Registration:** Verify that the advocate is properly enrolled with the State Bar Council.
- **Relevant Practice Experience:** Look for demonstrable experience in the specific subject matter rather than generalist practice.
- **Court of Practice:** Ensure the advocate routinely appears before the court or tribunal having jurisdiction over your case (e.g., District Court, High Court, NCLT, or Consumer Commission).
- **Track Record:** Assess their familiarity with local procedural rules, filing requirements, and judicial precedents.

## 3. Assess Communication and Professional Availability

Effective advocacy requires transparent and clear communication:
- **Accessibility:** Does the lawyer explain complex legal concepts in understandable terms without excessive jargon?
- **Realistic Case Assessment:** A dependable advocate provides an objective evaluation of strengths and risks rather than making unrealistic guarantees.
- **Responsiveness:** Ensure there is clarity regarding who will handle day-to-day communications, draft filings, and attend court hearings.

## 4. Understand Legal Fees and Billing Structures

Discuss professional fees transparently before formally engaging an advocate:
- **Fee Models:** Inquire whether fees are charged on a consultation basis, per-appearance schedule, staged milestone structure, or flat overall fee.
- **Out-of-Pocket Expenses:** Clarify responsibilities for court fees, stamp papers, typing/printing, process fees, and clerkage.
- **Written Agreement:** Request written confirmation or formal fee memos to avoid misunderstandings during litigation.

## 5. Prepare for the Initial Consultation

Make the most of your initial meeting by preparing thoroughly:
- Organize all relevant documents, contracts, notices, and correspondence in chronological order.
- Write down a concise summary of key facts, dates, and names.
- Prepare specific questions regarding legal options, procedural steps, anticipated timelines, and potential settlement avenues.

## 6. Consider Location and Court Jurisdiction

Litigation often requires multiple physical appearances, filings, and urgent court mentions. Choosing an advocate located near or regularly practicing in the relevant jurisdictional court complex can reduce travel expenses and streamline proceedings.

## 7. Using VakeelSetu to Connect with Verified Advocates

The VakeelSetu platform enables citizens and businesses to browse verified advocate profiles, filter by practice areas, review years of experience, check court practice locations, read client reviews, and schedule direct consultations with ease.

## Important Note

Finding the right advocate depends on your unique circumstances, financial budget, and case requirements. No directory or platform guarantees litigation outcomes. This guide is for educational information only and does not endorse specific legal practitioners.`,
      createdBy: creator.id
    },
    {
      title: 'How to File for Divorce',
      description: `## Overview

Filing for divorce is a significant legal and emotional process governed by personal and statutory laws in India. The legal framework provides mechanisms for the dissolution of marriage either through mutual agreement between spouses or through contested litigation on legally recognized grounds. Understanding the procedures, required documentation, and key legal considerations helps individuals navigate this transition responsibly.

## 1. Applicable Personal and Statutory Laws

In India, divorce procedures are governed by the law under which the marriage was solemnized:
- **Hindu Marriage Act, 1955:** Applies to Hindus, Buddhists, Jains, and Sikhs.
- **Special Marriage Act, 1954:** Applies to civil, inter-faith marriages registered under the Act.
- **Indian Divorce Act, 1869:** Applies to Christians.
- **Muslim Personal Law & Dissolution of Muslim Marriages Act, 1939:** Governs marriages among Muslims.
- **Parsi Marriage and Divorce Act, 1936:** Governs marriages among Parsis.

## 2. Mutual Consent vs. Contested Divorce

The legal process differs fundamentally based on whether both parties agree to dissolve the marriage:

### Mutual Consent Divorce
- Both spouses mutually agree that they cannot live together and have lived separately for the required statutory period (generally one year or more).
- Spouses amicably resolve all ancillary matters beforehand, including permanent alimony, return of Stridhan, division of joint assets, child custody, and visitation schedules.
- Requires filing joint petitions (First Motion and Second Motion) with a statutory cooling-off/reflection period, unless waived by the court under exceptional circumstances.
- This route is substantially faster, less expensive, and less contentious.

### Contested Divorce
- Initiated by one spouse when mutual agreement cannot be reached.
- Must be filed on specific statutory grounds such as cruelty (mental or physical), desertion, adultery, conversion, unsoundness of mind, or chronic communicable diseases.
- Involves formal trial proceedings, examination of witnesses, presentation of evidence, and judicial adjudication.

## 3. Key Issues to Address in Divorce Proceedings

Divorce proceedings encompass crucial interconnected considerations:
- **Child Custody and Welfare:** Determining physical and legal custody, visitation schedules, and holiday arrangements with the child's paramount welfare as the sole governing principle.
- **Maintenance and Alimony:** Determining interim maintenance during litigation and permanent alimony based on the financial capacities, standards of living, and needs of the parties.
- **Stridhan and Joint Property:** Ensuring the return of Stridhan (exclusive property of the woman) and equitable settlement of joint bank accounts, vehicles, and real estate investments.

## 4. Collecting Essential Documentation

Preparing the divorce petition requires assembling key supporting records:
- Marriage certificate and proof of marriage (e.g., wedding photographs, invitation card).
- Proof of residence establishing territorial jurisdiction.
- Passport-sized photographs of the petitioner(s).
- Evidence of living separately for the statutory period.
- Income tax returns, salary slips, and asset/liability declarations where maintenance is claimed.
- Specific documentary, digital, or medical evidence substantiating grounds in contested matters.

## 5. Identifying the Correct Family Court Jurisdiction

A divorce petition must be filed in the competent Family Court or District Court having territorial jurisdiction:
- Where the marriage was solemnized.
- Where the couple last resided together as husband and wife.
- Where the respondent resides at the time of presentation of the petition.
- Where the petitioner resides (under specific provisions available to wives under certain personal laws).

## 6. General Procedural Stages

The standard court process typically follows these milestones:
1. **Filing the Petition:** Drafting and presenting the petition with supporting affidavits and vakalatnama.
2. **Notice Issuance:** The court issues summons/notice to the respondent spouse.
3. **Mandatory Mediation & Counseling:** Family courts routinely refer parties to court-annexed counselors or mediation centers to explore reconciliation or settlement.
4. **Evidence & Arguments:** In contested matters, filing written statements, presenting evidence, and cross-examining witnesses.
5. **Final Judgment & Decree:** The court pronounces judgment and issues a certified copy of the divorce decree dissolving the marriage.

## 7. Consulting an Experienced Family Law Advocate

Divorce proceedings involve complex emotional, financial, and custody dimensions. Consulting a dedicated family law advocate ensures proper guidance, objective advice, and protection of your statutory rights throughout the legal process.

## Important Note

Divorce laws, statutory cooling periods, and personal law rules vary significantly across communities and case facts. This guide provides general educational awareness and should not be construed as individual legal counsel.`,
      createdBy: creator.id
    },
    {
      title: 'How to Register Property',
      description: `## Overview

Property registration is the official recording of property transactions with designated government authorities under the Registration Act, 1908. Registering a conveyance deed or sale deed provides public notice of ownership, prevents fraudulent transfers, establishes legal title, and creates an admissible permanent record in a court of law.

## 1. Pre-Registration Title Verification and Due Diligence

Prior to executing any property purchase or registration, conducting comprehensive legal due diligence is essential:
- **Title Search:** Verify the seller's clear, marketable, and unencumbered ownership title covering at least the past 30 years.
- **Mother Deed:** Examine the original chain of previous title deeds tracing ownership succession.
- **Encumbrance Certificate (EC):** Obtain an updated Encumbrance Certificate from the Sub-Registrar's Office to verify that the property is free from mortgages, liens, or legal attachments.
- **Khata / Patta / Mutation Records:** Confirm revenue records and ownership entries in municipal or revenue registers.
- **Approvals and Clearances:** For apartments and developed plots, inspect building plan sanctions, layout approvals, Commencement Certificates (CC), and Occupancy Certificates (OC).
- **Property Tax Receipts:** Ensure all municipal property taxes and utility bills have been cleared up to the date of transfer.

## 2. Understanding Agreement to Sell and Sale Deed

A standard transaction involves two primary legal instruments:
- **Agreement to Sell:** Details the commercial terms, payment milestones, possession handover dates, and obligations of buyer and seller prior to registration.
- **Sale Deed / Conveyance Deed:** The final legally binding document that officially transfers ownership title and possession from seller to buyer upon payment of full consideration.

## 3. Calculating Stamp Duty and Registration Charges

Every property registration requires the payment of statutory government fees:
- **Stamp Duty:** A state revenue tax calculated on the transaction value or the government circle/guideline rate (whichever is higher). Stamp duty rates vary by state, gender of the buyer, and property location (urban vs. rural).
- **Registration Fee:** An additional fee (typically 1% of property value or fixed state slabs) charged for the administrative processing and archiving of the deed.
- **Payment Method:** Generally paid through authorized e-stamping portals, designated bank challans, or state treasury portals.

## 4. Preparing Required Documentation

Assemble all necessary identity and supporting records before scheduling an appointment:
- Duly drafted Sale Deed on appropriate stamp paper or e-stamp certificate.
- PAN Cards and Aadhaar Cards (or verified identity proofs) of buyer, seller, and two independent adult witnesses.
- Passport-sized photographs of all participating parties and witnesses.
- Original previous title documents and tax payment receipts.
- Necessary statutory clearances or NOCs where applicable (e.g., society NOC or agricultural land clearances).

## 5. The Sub-Registrar Office Procedure

The formal execution and registration process typically involves:
1. **Online Slot Booking:** Reserving an appointment slot on the state government's registration department portal.
2. **Physical / Biometric Presence:** The buyer, seller, and two witnesses must be physically present before the jurisdictional Sub-Registrar.
3. **Verification of Documents:** The Sub-Registrar verifies original identity proofs, property papers, and stamp duty payment receipts.
4. **Biometric Capture & Signatures:** Biometric fingerprints, digital signatures, and photographs of all parties and witnesses are captured.
5. **Official Execution & Admission:** The seller formally admits receipt of consideration and execution of the sale deed.

## 6. Obtaining the Registered Deed and Post-Registration Steps

After verification, the Sub-Registrar's Office assigns a unique registration number, affixes official seals, and digitizes the deed:
- **Collection:** The original registered sale deed is typically issued within a few working days.
- **Safe Storage:** Safely store the original deed and secure certified copies for record-keeping.
- **Mutation of Property:** Apply for mutation in local municipal or revenue records (e.g., updating Khata/Patta) to ensure property tax assessments reflect the new owner's name.

## 7. Importance of Professional Legal Assistance

Engaging an experienced real estate advocate to review title deeds, draft the conveyance document, and oversee Sub-Registrar procedures protects buyers against title defects, undisclosed mortgages, and procedural invalidity.

## Important Note

Stamp duty rates, registration fees, portal mechanisms, and document requirements differ significantly across Indian states and union territories. This guide provides general educational awareness and does not represent specific legal advice.`,
      createdBy: creator.id
    }
  ];

  let createdGuidesCount = 0;
  let updatedGuidesCount = 0;

  for (const guideData of initialGuides) {
    const existing = await prisma.guide.findFirst({
      where: { title: guideData.title }
    });

    if (!existing) {
      await prisma.guide.create({
        data: guideData
      });
      createdGuidesCount++;
    } else {
      await prisma.guide.update({
        where: { id: existing.id },
        data: {
          description: guideData.description,
          createdBy: existing.createdBy || guideData.createdBy
        }
      });
      updatedGuidesCount++;
    }
  }

  console.log(`Guides seed finished: ${createdGuidesCount} created, ${updatedGuidesCount} updated.`);

  // Idempotent Seeding of Updates
  console.log('Seeding initial Updates (idempotent with detailed ~400-500 word content)...');
  const initialUpdates = [
    {
      title: 'Important Changes in Consumer Law',
      oldDescription: `Under the framework established by the Consumer Protection Act, 2019, Indian consumers gained substantial protections against unfair trade practices, misleading advertisements, and defective goods or deficient services. The statutory architecture introduced a robust three-tier adjudication mechanism comprising District, State, and National Consumer Disputes Redressal Commissions, along with central regulatory oversight through the Central Consumer Protection Authority (CCPA).

To enhance consumer access and modernise dispute resolution, digital mechanisms such as the National Consumer Helpline (NCH) and the e-Daakhil electronic filing portal were progressively operationalised. These facilities allowed consumers to lodge grievances, file formal consumer complaints online, pay requisite court fees digitally, and track dispute proceedings without strictly requiring initial in-person registry visits. The existing Consumer Protection (E-Commerce) Rules, 2020 established baseline obligations for e-commerce entities, including country-of-origin declarations, basic grievance officer appointments, and clear refund protocols. Consumers relied upon these established mechanisms to seek product replacements, refunds, and damages before jurisdictional Consumer Commissions.`,
      newDescription: `In September 2026, the Department of Consumer Affairs notified the Consumer Protection (E-Commerce) (Amendment) Rules, 2026 (published on 11 September 2026), introducing updated regulatory standards for online marketplaces, digital platforms, and e-commerce entities.

These amendment rules reflect the evolving digital marketplace by reinforcing requirements around transparent seller disclosures, authentic product listing information, clear commercial terms, and strengthened consumer grievance-redressal mechanisms. For online shoppers, the updated framework emphasizes fair transaction practices, enhanced accountability for listed product descriptions, and prompt dispute handling by platform grievance officers.

While these amendments refine e-commerce governance, consumers continue to be protected under the overarching Consumer Protection Act, 2019 and can approach District, State, and National Consumer Commissions through physical or digital (e-Daakhil) channels, including virtual hearings where available. In practical terms, online shoppers should exercise standard consumer diligence: verify seller profiles, carefully review cancellation and return terms before purchasing, and preserve all relevant transaction evidence—such as order confirmations, invoices, customer support communications, payment receipts, and delivery logs—when raising a dispute or seeking formal legal redressal.`,
      createdBy: creator.id
    },
    {
      title: 'New Digital Privacy Regulations',
      oldDescription: `Prior to the operationalisation of dedicated procedural rules, personal data protection in India was primarily guided by Section 43A of the Information Technology Act, 2000 and the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011. While this early framework introduced baseline requirements for handling sensitive personal data and obtaining basic privacy consent, it was limited in scope and lacked comprehensive provisions for contemporary digital data processing ecosystems.

The enactment of the Digital Personal Data Protection Act, 2023 (DPDP Act) marked a major milestone by establishing a statutory framework for processing digital personal data while recognising both the right of individuals (Data Principals) to protect their personal information and the legitimate need of organisations (Data Fiduciaries) to process data for lawful purposes. However, the comprehensive execution of the Act's principles—including detailed operational protocols, board procedures, and specific compliance mechanisms—remained contingent upon the notification and staged enforcement of formal statutory rules.`,
      newDescription: `The Ministry of Electronics and Information Technology (MeitY) notified the Digital Personal Data Protection Rules, 2025 (published on 14 November 2025), providing the comprehensive operational and procedural framework required to implement the DPDP Act, 2023.

The 2025 Rules specify the practical procedures through which organisations must ensure transparency, obtain informed and itemised consent, maintain robust security safeguards to prevent data breaches, and provide accessible notice to users. The Rules operationalise critical rights for Data Principals, including the right to access summaries of personal data processed, the right to correction and erasure, accessible grievance redressal mechanisms, and the right to nominate a representative in the event of death or incapacity.

The framework also outlines the operational functioning of the Data Protection Board of India, which is tasked with conducting inquiries, investigating reported personal data breaches, and addressing regulatory non-compliance. In accordance with the official explanatory note and staged commencement timeline, different provisions and compliance obligations become enforceable progressively over specified phases rather than simultaneously on the publication date. For individuals and businesses alike, this updated framework marks a transition toward structured, accountable, and legally enforceable digital privacy standards across India.`,
      createdBy: creator.id
    },
    {
      title: 'Recent Developments in Property and Land-Record Rules',
      oldDescription: `Traditionally, land administration and property documentation in India have been governed primarily at the State and Union Territory level, resulting in distinct regional revenue systems, local terminology, and state-specific procedural workflows. While the Registration Act, 1908 provides the overarching statutory basis for registering deeds and documents relating to immovable property, state governments administer local stamp acts, circle rates, Sub-Registrar offices, and revenue records.

Under this established system, property ownership documentation typically involves distinct stages managed across different administrative bodies: executing and registering conveyance instruments (such as Sale Deeds) at the Sub-Registrar's Office, followed by applying for mutation (updating revenue records, Khata, or Patta) before municipal or revenue authorities. Because registration records, revenue maps, and municipal tax databases historically operated in separate administrative silos, property buyers and advocates have always had to conduct extensive physical due diligence—including obtaining 30-year Encumbrance Certificates (EC), verifying chain title deeds, and inspecting local revenue registers—to verify marketable ownership.`,
      newDescription: `In September 2026, the Department of Land Resources announced the Digital India Land Records Modernization Programme (DILRMP) 3.0 (covering 2026–2031), representing the next phase in modernising and integrating India's land-record administration ecosystem.

DILRMP 3.0 focuses on advancing GIS-enabled spatial mapping, standardising digital land parcels, integrating revenue records with registration databases, and enhancing the accessibility of digital land records for citizens, farmers, and property owners. These initiatives aim to reduce property disputes, streamline administrative verification, and improve public transparency across participating States and Union Territories.

Importantly, DILRMP 3.0 represents an administrative and technological modernisation programme rather than a new nationwide property-registration statute. Because land and revenue administration remains a state subject, legal procedures, stamp duty rates, and registration requirements continue to be governed by respective State and Union Territory laws. Furthermore, digital land records and online portal entries serve as administrative records and do not by themselves automatically replace comprehensive title due diligence. Prospective property buyers must continue conducting formal title searches, verifying original title chains, checking encumbrance records at the jurisdictional Sub-Registrar Office, and confirming municipal mutation status before executing property transactions.`,
      createdBy: creator.id
    }
  ];

  let createdUpdatesCount = 0;
  let updatedUpdatesCount = 0;

  for (const updateData of initialUpdates) {
    const existing = await prisma.update.findFirst({
      where: { title: updateData.title }
    });

    if (!existing) {
      await prisma.update.create({
        data: updateData
      });
      createdUpdatesCount++;
    } else {
      await prisma.update.update({
        where: { id: existing.id },
        data: {
          oldDescription: updateData.oldDescription,
          newDescription: updateData.newDescription,
          createdBy: existing.createdBy || updateData.createdBy
        }
      });
      updatedUpdatesCount++;
    }
  }

  console.log(`Updates seed finished: ${createdUpdatesCount} created, ${updatedUpdatesCount} updated.`);

  // Seed IPC Sections from Bare Act PDF (Idempotent)
  console.log(`Seeding ${ipcSectionsData.length} IPC Sections from Bare Act PDF...`);
  let createdIPCCount = 0;
  let updatedIPCCount = 0;

  for (const ipc of ipcSectionsData) {
    const existing = await prisma.iPCSection.findUnique({
      where: { sectionNo: ipc.sectionNo }
    });

    if (!existing) {
      await prisma.iPCSection.create({
        data: {
          sectionNo: ipc.sectionNo,
          heading: ipc.heading,
          paragraph: ipc.paragraph,
          explanation: ipc.explanation,
          content: ipc.content,
          createdBy: creator.id
        }
      });
      createdIPCCount++;
    } else {
      await prisma.iPCSection.update({
        where: { sectionNo: ipc.sectionNo },
        data: {
          heading: ipc.heading,
          paragraph: ipc.paragraph,
          explanation: ipc.explanation,
          content: ipc.content,
          createdBy: creator.id
        }
      });
      updatedIPCCount++;
    }
  }
  console.log(`IPC Sections seed finished: ${createdIPCCount} created, ${updatedIPCCount} updated.`);

  // Seed BNS Sections from Bharatiya Nyaya Sanhita PDF (Idempotent)
  console.log(`Seeding ${bnsSectionsData.length} BNS Sections from Bharatiya Nyaya Sanhita PDF...`);
  let createdBNSCount = 0;
  let updatedBNSCount = 0;

  for (const bns of bnsSectionsData) {
    const existing = await prisma.bNSSection.findUnique({
      where: { sectionNo: bns.sectionNo }
    });

    if (!existing) {
      await prisma.bNSSection.create({
        data: {
          sectionNo: bns.sectionNo,
          heading: bns.heading,
          paragraph: bns.paragraph,
          explanation: bns.explanation,
          content: bns.content,
          createdBy: creator.id
        }
      });
      createdBNSCount++;
    } else {
      await prisma.bNSSection.update({
        where: { sectionNo: bns.sectionNo },
        data: {
          heading: bns.heading,
          paragraph: bns.paragraph,
          explanation: bns.explanation,
          content: bns.content,
          createdBy: creator.id
        }
      });
      updatedBNSCount++;
    }
  }
  console.log(`BNS Sections seed finished: ${createdBNSCount} created, ${updatedBNSCount} updated.`);

  // Seed Demo Advocates (Idempotent)
  console.log('Seeding Demo Advocates...');
  const demoPasswordHash = await bcrypt.hash('123456789', 10);

  const demoAdvocate1Data = {
    fullName: 'Arjun Sharma',
    email: 'demoadvocate1@gmail.com',
    passwordHash: demoPasswordHash,
    phone: '9999901001',
    barCouncilId: 'DEMO-BAR-1001',
    bestPracticeArea: 'Criminal Law',
    practiceAreas: ['Criminal Law', 'Criminal Defense'],
    experienceYears: 8,
    casesHandled: 45,
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    about: 'Experienced criminal law advocate specializing in criminal defense, bail matters, and litigation.',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=60',
    gender: 'Male',
    country: 'India',
    courtPractice: ['Delhi High Court', 'Supreme Court of India'],
    topCourtPractised: 'Delhi High Court',
    completeAddress: 'Chamber 101, Lawyers Block, High Court, New Delhi',
    videoCallChargePerMinute: 50.00,
    voiceCallChargePerMinute: 30.00,
    offlineVisitingFee: 1500.00,
    averageRating: 4.8,
    totalReviews: 12,
    status: 'ACTIVE',
    isActive: true,
    phoneVerified: true,
    emailVerified: true,
    aadhaarVerified: true,
    latitude: 28.6139,
    longitude: 77.2090
  };

  const demoAdvocate1 = await prisma.advocate.upsert({
    where: { email: 'demoadvocate1@gmail.com' },
    update: demoAdvocate1Data,
    create: demoAdvocate1Data
  });

  const demoAdvocate2Data = {
    fullName: 'Priya Verma',
    email: 'demoadvocate2@gmail.com',
    passwordHash: demoPasswordHash,
    phone: '9999901002',
    barCouncilId: 'DEMO-BAR-1002',
    bestPracticeArea: 'Civil Law',
    practiceAreas: ['Civil Law', 'Civil Litigation', 'Property Disputes'],
    experienceYears: 6,
    casesHandled: 32,
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    about: 'Civil law advocate specializing in property disputes, civil litigation, contracts, and related matters.',
    profilePhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=60',
    gender: 'Female',
    country: 'India',
    courtPractice: ['District Court Noida', 'Allahabad High Court'],
    topCourtPractised: 'Allahabad High Court',
    completeAddress: 'Suite 204, Legal Tower, Sector 62, Noida',
    videoCallChargePerMinute: 45.00,
    voiceCallChargePerMinute: 25.00,
    offlineVisitingFee: 1200.00,
    averageRating: 4.7,
    totalReviews: 8,
    status: 'ACTIVE',
    isActive: true,
    phoneVerified: true,
    emailVerified: true,
    aadhaarVerified: true,
    latitude: 28.5355,
    longitude: 77.3910
  };

  const demoAdvocate2 = await prisma.advocate.upsert({
    where: { email: 'demoadvocate2@gmail.com' },
    update: demoAdvocate2Data,
    create: demoAdvocate2Data
  });

  // Seed Confirmed Team Mate relationship between Demo Advocate 1 & Demo Advocate 2
  await prisma.advocateTeamMate.upsert({
    where: {
      advocateId_teamMateId: {
        advocateId: demoAdvocate1.id,
        teamMateId: demoAdvocate2.id
      }
    },
    update: {},
    create: {
      advocateId: demoAdvocate1.id,
      teamMateId: demoAdvocate2.id
    }
  });

  await prisma.advocateTeamMate.upsert({
    where: {
      advocateId_teamMateId: {
        advocateId: demoAdvocate2.id,
        teamMateId: demoAdvocate1.id
      }
    },
    update: {},
    create: {
      advocateId: demoAdvocate2.id,
      teamMateId: demoAdvocate1.id
    }
  });

  console.log('Demo Advocates (demoadvocate1@gmail.com & demoadvocate2@gmail.com) seeded successfully.');

  // 6. Seed Advocate Team Members for All Existing Advocates
  //await seedAdvocateTeamMembers();

  console.log('Database seeding successfully finished!');
}

async function seedAdvocateTeamMembers() {
  console.log('\nAdvocate Team Seed Started...\n');

  const advocates = await prisma.advocate.findMany({
    select: { id: true, fullName: true },
    orderBy: { createdAt: 'asc' }
  });

  const totalAdvocates = advocates.length;
  console.log(`Total advocates found: ${totalAdvocates}\n`);

  if (totalAdvocates < 4) {
    console.error('At least 4 advocates are required to seed 3 teammates per advocate.');
    return;
  }

  // Batch query all existing teammate relationships
  const allExistingLinks = await prisma.advocateTeamMate.findMany({
    select: { advocateId: true, teamMateId: true }
  });

  const existingPairSet = new Set(
    allExistingLinks.map(l => {
      const pair = [l.advocateId, l.teamMateId].sort();
      return `${pair[0]}_${pair[1]}`;
    })
  );

  const advocateTeammateMap = new Map();
  for (const adv of advocates) {
    advocateTeammateMap.set(adv.id, new Set());
  }

  for (const link of allExistingLinks) {
    if (advocateTeammateMap.has(link.advocateId)) {
      advocateTeammateMap.get(link.advocateId).add(link.teamMateId);
    }
    if (advocateTeammateMap.has(link.teamMateId)) {
      advocateTeammateMap.get(link.teamMateId).add(link.advocateId);
    }
  }

  const newRecordsToCreate = [];
  let totalSkipped = 0;

  for (let i = 0; i < advocates.length; i++) {
    const advocate = advocates[i];
    const currentTeammates = advocateTeammateMap.get(advocate.id);

    const neededCount = Math.max(0, 3 - currentTeammates.size);

    if (neededCount === 0) {
      console.log(`Advocate ${i + 1} → ${currentTeammates.size} teammates`);
      totalSkipped += 3;
      continue;
    }

    const candidates = advocates.filter(
      cand => cand.id !== advocate.id && !currentTeammates.has(cand.id)
    );

    const selectedCandidates = candidates.slice(0, neededCount);

    for (const candidate of selectedCandidates) {
      const pair = [advocate.id, candidate.id].sort();
      const pairKey = `${pair[0]}_${pair[1]}`;

      if (!existingPairSet.has(pairKey)) {
        existingPairSet.add(pairKey);
        newRecordsToCreate.push({
          advocateId: pair[0],
          teamMateId: pair[1]
        });

        currentTeammates.add(candidate.id);
        if (advocateTeammateMap.has(candidate.id)) {
          advocateTeammateMap.get(candidate.id).add(advocate.id);
        }
      } else {
        totalSkipped++;
      }
    }

    console.log(`Advocate ${i + 1} → ${currentTeammates.size} teammates`);
  }

  if (newRecordsToCreate.length > 0) {
    await prisma.advocateTeamMate.createMany({
      data: newRecordsToCreate,
      skipDuplicates: true
    });
  }

  console.log(`\nNew teammate relationships created: ${newRecordsToCreate.length}`);
  console.log(`Existing relationships skipped: ${totalSkipped}`);
  console.log('\nAdvocate team seed completed successfully.\n');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
