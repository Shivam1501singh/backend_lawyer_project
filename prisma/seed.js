import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Clean existing seed data
  // We can delete by matching emails/phones of our mock data to avoid deleting real user data,
  // or do a clean reset of mock records. Let's delete reviews first, then advocates/users.
  const mockUserEmails = ['client.rahul@example.com', 'client.ananya@example.com', 'client.rohit@example.com'];
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
      isActive: true,
      experienceYears: 14,
      casesWon: 245,
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
      isActive: true,
      experienceYears: 8,
      casesWon: 110,
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
      isActive: true,
      experienceYears: 10,
      casesWon: 180,
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
      isActive: true,
      experienceYears: 6,
      casesWon: 65,
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
      isActive: true,
      experienceYears: 16,
      casesWon: 310,
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
      isActive: true,
      experienceYears: 11,
      casesWon: 145,
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
    { state: 'Delhi', city: 'New Delhi', pincode: '110001' },
    { state: 'Maharashtra', city: 'Mumbai', pincode: '400001' },
    { state: 'Maharashtra', city: 'Pune', pincode: '411001' },
    { state: 'Karnataka', city: 'Bengaluru', pincode: '560001' },
    { state: 'Tamil Nadu', city: 'Chennai', pincode: '600001' },
    { state: 'West Bengal', city: 'Kolkata', pincode: '700001' },
    { state: 'Uttar Pradesh', city: 'Noida', pincode: '201301' },
    { state: 'Uttar Pradesh', city: 'Lucknow', pincode: '226001' },
    { state: 'Gujarat', city: 'Ahmedabad', pincode: '380001' },
    { state: 'Rajasthan', city: 'Jaipur', pincode: '302001' },
    { state: 'Telangana', city: 'Hyderabad', pincode: '500001' },
    { state: 'Kerala', city: 'Kochi', pincode: '682001' }
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
      isActive: true,
      experienceYears: exp,
      casesWon: won,
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
    const adv = await prisma.advocate.create({ data });
    advocates.push(adv);
  }
  console.log(`Seeded ${advocates.length} advocates successfully.`);

  // 4. Seed Reviews & Calculate Ratings
  console.log('Seeding reviews...');
  const reviewsData = [];

  // Static reviews for first 6 advocates
  const staticReviews = [
    // Rajesh Sharma Reviews
    { userId: users[0].id, advocateId: advocates[0].id, rating: 5, reviewText: 'Advocate Rajesh is extremely knowledgeable and professional. He handled our family bail application with utmost diligence and secured the bail in record time. Highly recommended!' },
    { userId: users[1].id, advocateId: advocates[0].id, rating: 4, reviewText: 'Very experienced lawyer. Answered all my criminal litigation queries clearly. The fees are high but worth the professional expertise.' },
    
    // Priya Patel Reviews
    { userId: users[1].id, advocateId: advocates[1].id, rating: 5, reviewText: 'Excellent corporate legal consultant. She reviewed our term sheets and shareholder agreements thoroughly. Great for tech startups.' },
    { userId: users[2].id, advocateId: advocates[1].id, rating: 5, reviewText: 'Priya helped us register our trademark and patent files. Her advice was prompt and clear. Will definitely hire her again.' },
    
    // Amit Verma Reviews
    { userId: users[2].id, advocateId: advocates[2].id, rating: 4, reviewText: 'Amit helped resolving a property dispute with our tenant. Good knowledge of local RERA rules and civil procedures.' },
    
    // Sneha Iyer Reviews
    { userId: users[0].id, advocateId: advocates[3].id, rating: 5, reviewText: 'Sneha was incredibly compassionate and logical during a stressful child custody dispute. Excellent family court advocacy.' },
    { userId: users[2].id, advocateId: advocates[3].id, rating: 4, reviewText: 'Highly supportive lawyer. Handled my mutual divorce proceedings smoothly.' },

    // Vikram Singh Reviews
    { userId: users[1].id, advocateId: advocates[4].id, rating: 5, reviewText: 'Superb taxation advice. Solved a complicated corporate tax audit problem easily.' }
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

  // For each advocate, check which users have not reviewed them and add reviews from them
  for (const adv of advocates) {
    for (const user of users) {
      const exists = reviewsData.some(r => r.advocateId === adv.id && r.userId === user.id);
      if (!exists) {
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
      const averageRating = sumRating / totalReviews;

      await prisma.advocate.update({
        where: { id: adv.id },
        data: {
          averageRating: averageRating,
          totalReviews: totalReviews
        }
      });
      console.log(`Updated rating for ${adv.fullName}: Avg: ${averageRating.toFixed(2)}, Count: ${totalReviews}`);
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

  console.log('Database seeding successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
