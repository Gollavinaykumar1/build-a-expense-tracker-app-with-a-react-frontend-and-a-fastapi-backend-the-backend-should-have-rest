import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { clsx } from 'clsx';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const App = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState([]);
  const [filter, setFilter] = useState('all');
  const { register, handleSubmit, reset } = useForm();
  const toastRef = useRef(null);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await axios.get(`${BASE_URL}/expenses`);
      const safeList = Array.isArray(response.data) ? response.data : (response.data?.items || []);
      setExpenses(safeList);
      calculateTotal(safeList);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const calculateTotal = (expenses) => {
    const totalAmount = expenses.reduce((acc, expense) => acc + expense.amount, 0);
    setTotal(totalAmount);
  };

  const addExpense = async (data) => {
    try {
      const response = await axios.post(`${BASE_URL}/expenses`, data);
      fetchExpenses();
      reset();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/expenses/${id}`);
      fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const filterExpenses = (category) => {
    setFilter(category);
  };

  const getCategories = () => {
    const uniqueCategories = [...new Set(expenses.map((expense) => expense.category))];
    setCategories(uniqueCategories);
  };

  useEffect(() => {
    fetchExpenses();
    getCategories();
  }, [fetchExpenses]);

  const Header = () => {
    return (
      <header className="bg-white py-4">
        <h1 className="text-3xl font-bold text-gray-900">Expense Tracker</h1>
      </header>
    );
  };

  const Footer = () => {
    return (
      <footer className="bg-gray-200 py-4 text-gray-600">
        <p>&copy; 2024 Expense Tracker</p>
      </footer>
    );
  };

  const ExpenseList = () => {
    const filteredExpenses = filter === 'all' ? expenses : expenses.filter((expense) => expense.category === filter);

    return (
      <table className="w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Amount</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Notes</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredExpenses.map((expense) => (
            <tr key={expense.id} className="border-b border-gray-200">
              <td className="px-4 py-2">{expense.category}</td>
              <td className="px-4 py-2">${expense.amount}</td>
              <td className="px-4 py-2">{format(new Date(expense.date), 'yyyy-MM-dd')}</td>
              <td className="px-4 py-2">{expense.notes}</td>
              <td className="px-4 py-2">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => deleteExpense(expense.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const AddExpenseForm = () => {
    const onSubmit = async (data) => {
      await addExpense(data);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto p-4 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-gray-900">Add Expense</h2>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">Description</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="description" type="text" {...register('description')} />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">Amount</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="amount" type="number" {...register('amount')} />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">Category</label>
          <select className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" id="category" {...register('category')}>
            <option value="Food">Food</option>
            <option value="Transport">Transport</option>
            <option value="Bills">Bills</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">Date</label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="date" type="date" {...register('date')} />
        </div>
        <div className="mt-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">Notes</label>
          <textarea className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="notes" {...register('notes')} />
        </div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="submit">Add Expense</button>
      </form>
    );
  };

  const CategoryFilter = () => {
    return (
      <div className="flex flex-wrap justify-center mb-4">
        <button className={clsx('px-4 py-2 rounded', filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600')} onClick={() => filterExpenses('all')}>All</button>
        {categories.map((category) => (
          <button key={category} className={clsx('px-4 py-2 rounded', filter === category ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600')} onClick={() => filterExpenses(category)}>{category}</button>
        ))}
      </div>
    );
  };

  const TotalSummary = () => {
    return (
      <div className="bg-gray-100 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Total Summary</h2>
        <p className="text-3xl font-bold text-gray-900">Total: ${total}</p>
      </div>
    );
  };

  return (
    <div className="app-wrapper">
      <Header />
      <main className="container mx-auto p-4">
        <CategoryFilter />
        <ExpenseList />
        <AddExpenseForm />
        <TotalSummary />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
};

export default App;