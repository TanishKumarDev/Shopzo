import tryCatch from '../utils/tryCatch.js';
import { Address } from '../models/Address.js';

// Add a new address for the authenticated user
export const addAddress = tryCatch(async (req, res) => {
  const { address, phoneNumber } = req.body;

  // Create a new address document linked to the user
  const newAddress = await Address.create({
    address,
    phoneNumber,
    user: req.user._id
  });

  res.status(201).json({ address: newAddress });
});

// Get all addresses for the authenticated user
export const getAddress = tryCatch(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res.status(200).json({ addresses });
});

// Get a single address by its ID
export const getSingleAddress = tryCatch(async (req, res) => {
  const address = await Address.findById(req.params.id);
  if (!address) {
    return res.status(404).json({ message: 'Address not found' });
  }
  res.status(200).json({ address });
});

// Delete an address by its ID for the authenticated user
export const deleteAddress = tryCatch(async (req, res) => {
  // Find the address by ID and user to ensure ownership
  const address = await Address.findOne({
    _id: req.params.id,
    user: req.user._id
  });
  if (!address) {
    return res.status(404).json({ message: 'Address not found' });
  }
  await address.deleteOne();
  res.status(200).json({ message: 'Address deleted' });
});