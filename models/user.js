import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import driver from "../db/connect.js"



const USER_LABEL = 'User';

const User = {
  create: async ({ name, email, password }) => {
    const session = driver.session();
    try {
      const userId = uuidv4();

      const salt = await bcryptjs.genSalt(10);
      const hashedPassword = await bcryptjs.hash(password, salt);

      await session.run(
        `
        CREATE (u:${USER_LABEL} {
          id: $userId,
          name: $name,
          email: $email,
          password: $password
        })
        `,
        { userId, name, email, password: hashedPassword }
      );

      return { id: userId, name, email };
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    } finally {
      await session.close();
    }
  },

  
    findByCredentials: async (email, password) => {
      const session = driver.session();
      try {
        const result = await session.run(
          `
          MATCH (u:${USER_LABEL} { email: $email })
          RETURN u
          `,
          { email }
        );
  
        const record = result.records[0];
        if (!record) {
          return null; 
        }
  
        const user = record.get('u').properties;
  
        const isPasswordMatch = await bcryptjs.compare(password, user.password);
        if (!isPasswordMatch) {
          return null; 
        }
  
        return user;
      } catch (error) {
        console.error('Error finding user by credentials:', error);
        throw new Error('Failed to find user by credentials');
      } finally {
        await session.close();
      }
    },

      findById: async (userId) => {
        const session = driver.session();
        try {
          const result = await session.run(
            `
            MATCH (u:${USER_LABEL} { id: $userId })
            RETURN u
            `,
            { userId }
          );
    
          const record = result.records[0];
          if (!record) {
            return null;
          }
    
          return record.get('u').properties;
        } catch (error) {
          console.error('Error finding user by ID:', error);
          throw new Error('Failed to find user by ID');
        } finally {
          await session.close();
        }
      },
    
  

  findByEmail: async (email) => {
    const session = driver.session();
    try {
      const result = await session.run(
        `
        MATCH (u:${USER_LABEL} { email: $email })
        RETURN u
        `,
        { email }
      );

      const record = result.records[0];
      if (!record) {
        return null;
      }

      return record.get('u').properties;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    } finally {
      await session.close();
    }
  },

  comparePassword: async (candidatePassword, hashedPassword) => {
    return bcryptjs.compare(candidatePassword, hashedPassword);
  },

  createToken: (userId) => {
    return jwt.sign(
      { userId },
      process.env.SECRET_KEY,
      { expiresIn: process.env.LIFETIME }
    );
  }
};

export default User;
