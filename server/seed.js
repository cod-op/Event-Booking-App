const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const users = [
   { name: 'Admin User', 
      email: process.env.ADMIN_EMAIL , 
      password: process.env.ADMIN_PASSWORD ,
       role: 'admin'
     },
    { name: 'Demo User', email: 'user@eventora.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@eventora.com', password: 'password123', role: 'user' },
    { name: 'Bob Johnson', email: 'bob@eventora.com', password: 'password123', role: 'user' },
    { name: 'Charlie Dave', email: 'charlie@eventora.com', password: 'password123', role: 'user' },
    { name: 'Diana Prince', email: 'diana@eventora.com', password: 'password123', role: 'user' },
    { name: 'Ethan Hunt', email: 'ethan@eventora.com', password: 'password123', role: 'user' },
    { name: 'Fiona Gallagher', email: 'fiona@eventora.com', password: 'password123', role: 'user' },
    { name: 'George Miller', email: 'george@eventora.com', password: 'password123', role: 'user' },
    { name: 'Hannah Montana', email: 'hannah@eventora.com', password: 'password123', role: 'user' }
];

const events = [
    {
        title: 'React & Node.js Developer Retreat',
        description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        location: 'Silicon Valley Innovation Center, CA',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        location: 'Grand Arena, New York',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        location: 'The Ritz-Carlton, London',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        imageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2024',
        description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        location: 'Downtown Art Museum',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch & Pitch Competition',
        description: 'Watch 25 startups pitch for 1 million dollars in seed funding. Great networking for entrepreneurs and angel investors.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        location: 'Convention Center, Miami',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 100,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 days from now
        location: 'Tech Hub, Seattle',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },
     {
    title: 'Modern Art Expo 2024',
    description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: 'Downtown Art Museum',
    category: 'Art',
    totalSeats: 300,
    ticketPrice: 200,
    imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Jazz Night Live',
    description: 'Experience smooth jazz with renowned local and international artists in a cozy evening setting.',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    location: 'City Music Hall',
    category: 'Music',
    totalSeats: 150,
    ticketPrice: 350,
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Tech Innovators Conference 2024',
    description: 'Join leading tech minds and startups to explore AI, blockchain, and emerging innovations.',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    location: 'Convention Center',
    category: 'Technology',
    totalSeats: 500,
    ticketPrice: 500,
    imageUrl: 'https://www.psmpartners.com/wp-content/uploads/2023/10/Blog-Graphic-25.png'
  },
  {
    title: 'Gourmet Food Festival',
    description: 'Taste exquisite cuisines from top chefs and local culinary talents in a food lover’s paradise.',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    location: 'Central Park Plaza',
    category: 'Food & Drink',
    totalSeats: 400,
    ticketPrice: 250,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Marathon for Charity',
    description: 'Run for a cause! Participate in our city marathon and support local charities and NGOs.',
    date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    location: 'City Stadium',
    category: 'Sports',
    totalSeats: 1000,
    ticketPrice: 100,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Comedy Night Extravaganza',
    description: 'Laugh out loud with top comedians performing live on stage. An evening full of fun and giggles.',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    location: 'Grand Theater',
    category: 'Comedy',
    totalSeats: 200,
    ticketPrice: 150,
    imageUrl: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Photography Workshop',
    description: 'Learn professional photography techniques from experts in this hands-on workshop.',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    location: 'Art & Photo Studio',
    category: 'Workshop',
    totalSeats: 50,
    ticketPrice: 300,
    imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.yLsMn_H3AN_2R9sFl5WwegHaE7?rs=1&pid=ImgDetMain&o=7&rm=3'
  },
  {
    title: 'International Film Festival',
    description: 'Watch award-winning films from around the world and attend Q&A sessions with directors.',
    date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    location: 'Cineplex Cinema Hall',
    category: 'Film',
    totalSeats: 350,
    ticketPrice: 400,
    imageUrl: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Yoga & Wellness Retreat',
    description: 'Relax and rejuvenate with guided yoga sessions, meditation, and wellness workshops.',
    date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    location: 'Mountain View Resort',
    category: 'Health',
    totalSeats: 100,
    ticketPrice: 600,
    imageUrl: 'https://wallpaperaccess.com/full/654400.jpg'
  },
  {
    title: 'Literature & Poetry Evening',
    description: 'Immerse yourself in the world of words with poetry readings, author talks, and literary discussions.',
    date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    location: 'City Library Auditorium',
    category: 'Literature',
    totalSeats: 120,
    ticketPrice: 100,
    imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800'
  }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log('\n✅ MongoDB connection open...');

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        // Hash user passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total dummy users.`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} distinct events with Unsplash images.`);

        // Generate Bookings Data
        const bookingsData = [];

        for (const event of createdEvents) {
            // Assign 3-6 random users to each event
            const randomCount = Math.floor(Math.random() * 4) + 3;
            // Shuffle and pick random users
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                // Randomize statuses
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    // Usually confirmed tickets are marked paid (90% of the time)
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                // Deduct available seats specifically for confirmed tickets!
                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy bookings (confirmed, pending, cancelled, paid, not_paid).`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        
        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();