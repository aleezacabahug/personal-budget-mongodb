const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/personalBudgetDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connection successful"))
.catch(err => console.error("MongoDB connection error:", err));

const budgetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  hexColor: { 
    type: String, 
    required: true,
    validate: {
      validator: function(value) {
        return /^#[0-9A-F]{6}$/i.test(value);
      },
      message: props => `${props.value} is not a valid hex color!`
    }
  }
});

const BudgetModel = mongoose.model('BudgetModel', budgetSchema);

app.get('/budget', async (req, res) => {
  try {
    const budgetItems = await BudgetModel.find({});
    res.json({ budget: budgetItems });
  } catch (err) {
    res.status(500).send("Database fetch error");
  }
});

app.post('/budget', async (req, res) => {
  const { name, amount, hexColor } = req.body;

  if (!name || !amount || !hexColor) {
    return res.status(400).send("All fields (name, amount, hexColor) are required");
  }

  const newBudgetEntry = new BudgetModel({ name, amount, hexColor });

  try {
    const savedEntry = await newBudgetEntry.save();
    res.status(201).json(savedEntry);
  } catch (err) {
    res.status(500).send("Database save error");
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});