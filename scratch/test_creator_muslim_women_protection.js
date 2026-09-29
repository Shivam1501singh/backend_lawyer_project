import axios from 'axios';
import express from 'express';
import cookieParser from 'cookie-parser';
import bearerActRoutes from '../src/routes/bearerAct.routes.js';
import { errorHandler } from '../src/middleware/error.middleware.js';
import { signToken } from '../src/utils/jwt.js';
import prisma from '../src/lib/prisma.js';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bearerActRoutes);
app.use(errorHandler);

const PORT = 5599;
const BASE_URL = `http://localhost:${PORT}`;

const ACT_HEADING = 'THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986';

async function testContentCreator() {
  const server = app.listen(PORT);
  try {
    const creator = await prisma.contentCreator.findFirst();
    if (!creator) {
      console.error('No content creator found');
      process.exit(1);
    }

    const token = signToken({ id: creator.id, email: creator.email, type: 'CONTENT_CREATOR' });

    const personalCat = await prisma.bearerAct.findUnique({ where: { name: 'Personal' } });
    const mwprdaAct = await prisma.act.findFirst({
      where: { bearerActId: personalCat.id, heading: ACT_HEADING }
    });

    console.log('Testing Content Creator write endpoint for The Muslim Women (Protection of Rights on Divorce) Act, 1986...');
    const res = await axios.post(
      `${BASE_URL}/api/content-creator/bearer-acts`,
      {
        type: 'ACT',
        operation: 'UPDATE',
        data: {
          id: mwprdaAct.id,
          heading: ACT_HEADING,
          year: 1986
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Content Creator update response status:', res.status, res.data.message);
    if (res.status === 200 && res.data.success) {
      console.log('✅ Content Creator write endpoint verified successfully for THE MUSLIM WOMEN (PROTECTION OF RIGHTS ON DIVORCE) ACT, 1986!');
    } else {
      console.error('❌ Content Creator write endpoint failed');
      process.exit(1);
    }
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

testContentCreator();
