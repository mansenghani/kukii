const Customer = require('../models/Customer');

exports.createCustomer = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const customer = new Customer({ name, email, phone });
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
