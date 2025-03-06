import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import styles from "./Metrics.module.scss"; 
import CountUp from "react-countup"; 
import { FaShoppingCart, FaCoins, FaUsers, FaChartLine } from "react-icons/fa"; // Import icons
import { ClipLoader } from "react-spinners"; // Import a loading spinner

const Metrics: React.FC = () => {
  const [weeklySalesData, setWeeklySalesData] = useState<{ week: string; totalSales: number }[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [orderStatusCounts, setOrderStatusCounts] = useState<{ pending: number; completed: number }>({
    pending: 0,
    completed: 0,
  });
  const [popularProducts, setPopularProducts] = useState<{ name: string; imageUrl: string; totalQuantity: number }[]>([]);
  const [customerData, setCustomerData] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true); // Add loading state

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true before fetching data
        const weeklySalesResponse = await axios.get("http://localhost:5000/api/orders/weekly-sales-data");
        const totalSalesResponse = await axios.get("http://localhost:5000/api/orders/total-sales");
        const totalRevenueResponse = await axios.get("http://localhost:5000/api/orders/total-revenue");
        const totalCustomersResponse = await axios.get("http://localhost:5000/api/orders/total-customers");
        const orderStatusResponse = await axios.get("http://localhost:5000/api/orders/order-status-summary");
        const popularProductsResponse = await axios.get("http://localhost:5000/api/orders/popular-orders");
        const newReturningCustomersresponse = await axios.get("http://localhost:5000/api/orders/new-returning-customers");

        setWeeklySalesData(weeklySalesResponse.data);
        setTotalSales(totalSalesResponse.data.totalSales);
        setTotalRevenue(totalRevenueResponse.data.totalRevenue);
        setTotalCustomers(totalCustomersResponse.data.totalCustomers);
        setOrderStatusCounts({
          pending: orderStatusResponse.data.pending || 0,
          completed: orderStatusResponse.data.completed || 0,
        });
        setPopularProducts(popularProductsResponse.data);
        setCustomerData([
          { name: "New Customers", count: newReturningCustomersresponse.data.newCustomers },
          { name: "Returning Customers", count: newReturningCustomersresponse.data.returningCustomers },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Set loading to false after data is fetched
      }
    };
    fetchData();
  }, []);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 16) return "Good Afternoon";
    return "Good Evening";
  };

  // Get current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get current time
  const getCurrentTime = () => {
    const date = new Date();
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Data for the Pie Chart
  const pieChartData = [
    { name: "Pending", value: orderStatusCounts.pending },
    { name: "Completed", value: orderStatusCounts.completed },
  ];

  // Colors for the Pie Chart segments.
  const COLORS = ["#ff9a9e", "#a8e6cf"];

  // Render loading spinner if data is being fetched
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <ClipLoader color="#297e7c" size={50} />
        <p>Loading data...</p>
      </div>
    );
  }

  return (
    <div className={styles.metricsContainer}>
      {/* Left side */}
      <div className={styles.leftContainer}>
        {/* Greeting, Date, and Time */}
        <div className={styles.greetingContainer}>
          <h1>{getGreeting()}</h1>
          <p>{getCurrentDate()}</p>
          <p>{getCurrentTime()}</p>
        </div>

        {/* Metrics Grid */}
        <div className={styles.metricsGrid}>
          <div className={styles.metricBox}>
            <FaShoppingCart className={styles.metricIcon} />
            <CountUp end={totalSales} duration={1.5} separator="," className={styles.countUpNumber} />
            <h3>Units Sold</h3>
          </div>
          <div className={styles.metricBox}>
            <FaCoins  className={styles.metricIcon} />
            <CountUp end={totalRevenue} duration={1.5} prefix="₦" separator="," decimals={2} className={styles.countUpNumber} />
            <h3>Total Revenue</h3>
          </div>
          <div className={styles.metricBox}>
            <FaUsers className={styles.metricIcon} />
            <CountUp end={totalCustomers} duration={1.5} separator="," className={styles.countUpNumber} />
            <h3>Total Customers</h3>
          </div>
          <div className={styles.metricBox}>
            <FaChartLine className={styles.metricIcon} />
            <CountUp
              end={weeklySalesData.reduce((sum, week) => sum + week.totalSales, 0)}
              duration={1.5}
              prefix="₦"
              separator=","
              decimals={2}
              className={styles.countUpNumber}
            />
            <h3>Weekly Sales</h3>
          </div>
        </div>

        <div className={styles.popularAndCustomers}>
          {/* Popular Products Section */}
          <div className={styles.popularProductsContainer}>
            <h2>Popular Products</h2>
            <div className={styles.popularProductsList}>
              {popularProducts.map((product, index) => (
                <div key={index} className={styles.productItem}>
                  <img src={product.imageUrl} alt={product.name} className={styles.productImage} />
                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productQuantity}>Total Ordered: {product.totalQuantity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New vs Returning Customers Chart */}
          <div className={styles.chartWrapper}>
            <div className={styles.chartHeader}>
              <h2>New vs Returning Customers</h2>
            </div>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={customerData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 14, fill: "#555" }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 14, fill: "#555" }} />
                  <Tooltip cursor={{ fill: "rgba(0, 0, 0, 0.05)" }} />
                  <Bar dataKey="count" fill="url(#gradient)" barSize={15} radius={[0, 8, 8, 0]} />
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#ff7eb3" />
                      <stop offset="100%" stopColor="#ff758c" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className={styles.rightContainer}>
        {/* Weekly Sales Chart */}
        <div className={styles.chartContainer}>
          <h2>Weekly Sales</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklySalesData}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="week" tick={{ fontSize: 14, fill: "#666" }} />
              <YAxis tick={{ fontSize: 14, fill: "#666" }} />
              <Tooltip
                cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#222",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  padding: "10px",
                }}
              />
              <Bar
                dataKey="totalSales"
                fill="url(#gradientSales)"
                barSize={35}
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="gradientSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6a11cb" />
                  <stop offset="100%" stopColor="#2575fc" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pending vs Completed Orders Pie Chart */}
        <div className={styles.chartContainer}>
          <h2>Pending vs Completed Orders</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label
              >
                {pieChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend
                align="right"
                verticalAlign="middle"
                layout="vertical"
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Metrics;