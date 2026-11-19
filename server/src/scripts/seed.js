import { connectDB, disconnectDB } from '../config/db.js';
import { env } from '../config/env.js';
import { EVENT_STATUS, ROLES } from '../config/constants.js';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';

const days = (n) => new Date(Date.now() + n * 86_400_000);

const DEMO_EVENTS = [
  ['Midnight Jazz Sessions', 'Music', 'Blue Note Hall, Kochi', 7, '20:00', '23:00', 799, 120],
  ['Startup Pitch Night', 'Business', 'Tech Hub, Infopark', 10, '17:30', '20:30', 0, 80],
  ['Kerala Food Carnival', 'Food', 'Marine Drive Grounds', 14, '11:00', '22:00', 250, 500],
  ['Stand-up Showdown', 'Comedy', 'Town Theatre', 5, '19:00', '21:30', 499, 60],
  ['Backwater Photo Walk', 'Workshop', 'Alleppey Jetty', 21, '06:00', '10:00', 1200, 25],
  ['Indie Film Marathon', 'Film', 'Cinema One', 30, '10:00', '22:00', 350, 150],
];

async function main() {
  await connectDB();

  if (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD) {
    throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to seed the admin account');
  }
  let admin = await User.findOne({ email: env.ADMIN_EMAIL.toLowerCase() });
  if (admin) {
    console.log(`Admin already exists: ${admin.email}`);
  } else {
    admin = await User.create({ name: env.ADMIN_NAME, email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD, role: ROLES.ADMIN });
    console.log(`Admin created: ${admin.email}`);
  }

  if (process.argv.includes('--demo')) {
    for (const [title, category, location, inDays, startTime, endTime, ticketPrice, totalTickets] of DEMO_EVENTS) {
      if (await Event.exists({ title })) continue;
      const eventDate = days(inDays);
      const [h, m] = startTime.split(':').map(Number);
      eventDate.setHours(h, m, 0, 0);
      await Event.create({
        title, category, location, eventDate, startTime, endTime, ticketPrice, totalTickets,
        availableTickets: totalTickets,
        description: `${title} - an evening you will want to tell people about. Seats are limited, so book early.`,
        status: EVENT_STATUS.PUBLISHED,
        organizerId: admin._id,
      });
    }
    console.log('Demo events ready');
  }
  await disconnectDB();
}

main().catch(async (err) => {
  console.error(err.message);
  await disconnectDB();
  process.exit(1);
});
