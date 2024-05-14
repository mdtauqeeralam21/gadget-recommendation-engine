import  driver  from "../db/connect.js";
import xssFilters from "xss-filters";

import { StatusCodes } from 'http-status-codes';
import User from '../models/user.js';

const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Please provide all values" });
  }

  try {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: `The email: ${email} is already in use.` });
    }

    const newUser = await User.create({ name, email, password });

    const token = User.createToken(newUser.id);

    res.cookie('token', token, {
      httpOnly: true,
    });

    return res.status(StatusCodes.CREATED).json({
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};



const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ error: "Please provide all values" });
  }

  try {
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ error: "Invalid Credentials" });
    }

    const token = User.createToken(user.id);

    res.cookie('token', token, {
      httpOnly: true,
    });

    return res
      .status(StatusCodes.OK)
      .json({ user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("Error logging in user:", error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Internal server error" });
  }
};


const updateUser = async (req, res) => {
  const { email, name, lastName, location } = req.body;

  if (!email || !name || !lastName || !location) {
    return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Please provide all values' });
  }

  const session = driver.session();

  try {
    await session.run(
      'MATCH (u:User {email: $email}) SET u.name = $name, u.lastName = $lastName, u.location = $location',
      { email: email, name: xssFilters.inHTMLData(name), lastName: xssFilters.inHTMLData(lastName), location: xssFilters.inHTMLData(location) }
    );

    return res.status(StatusCodes.OK).json({ message: 'User information updated successfully' });
  } catch (error) {
    console.error('Error updating user information:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  } finally {
    await session.close();
  }
};



const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({ error: 'User not found' });
    }

    return res.status(StatusCodes.OK).json({ user: { name: user.name, email: user.email,location:user.location,lastName:user.lastName } });
  } catch (error) {
    console.error('Error fetching current user information:', error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
};


const logout = async (req, res) => {
  res.clearCookie('token');

  return res.status(StatusCodes.OK).json({ message: 'User logged out successfully' });
};



export { register, login , updateUser, getCurrentUser, logout  };
