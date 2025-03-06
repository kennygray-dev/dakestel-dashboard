import React, { useState, useEffect } from "react";
import axios from "axios";
import { Order } from "../types";
import styles from "./Orders.module.scss";
import { jsPDF } from "jspdf";

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/orders");
        // Sort orders by latest first
        const sortedOrders = response.data.sort(
          (a: Order, b: Order) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Handle status update
  const handleStatusUpdate = async (orderId: string, newStatus: "pending" | "completed") => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, { status: newStatus });

      alert("Order status updated successfully!");

      // Update the local state to reflect the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          String(order._id) === String(orderId) ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Error updating order status. Please try again.");
    }
  };

  // Handle order deletion
  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`);

      alert("Order deleted successfully!");
      // Remove the order from local state
      setOrders((prevOrders) => prevOrders.filter((order) => String(order._id) !== String(orderId)));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Error deleting order. Please try again.");
    }
  };

  // Generate PDF for an order
  const generatePDF = (order: Order) => {
    const doc = new jsPDF();
    doc.setFont("Courier");
    doc.setFontSize(14);
    doc.text("Order Receipt", 10, 10);
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 10, 20);
    doc.text(`Customer: ${order.customerName}`, 10, 30);
    doc.text(`Email: ${order.customerEmail}`, 10, 40);
    doc.text(`Phone: ${order.customerPhone}`, 10, 50);
    doc.text(`Total Amount: ₦${Number(order.totalAmount).toFixed(2)}`, 10, 60);
    doc.text(`Status: ${order.status}`, 10, 70);
    doc.text("Products:", 10, 80);

    let y = 90;
    order.products.forEach((item, index) => {
      const product = typeof item.product === "string" ? { name: "Unknown Product", _id: item.product } : item.product;
      doc.text(`${index + 1}. ${product.name} - ${item.quantity}`, 10, y);
      y += 10;
    });

    doc.text("Thank you for your purchase!", 10, y + 10);
    doc.save(`Order_${order._id}.pdf`);
  };

  return (
    <div className={styles.ordersContainer}>
      <h1>Orders</h1>

      {loading && <p>Loading orders...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.ordersList}>
        {orders.length === 0 && !loading && <p>No orders found.</p>}

        {orders.map((order) => (
          <li key={String(order._id)} className={styles.orderCard}>
            <p><strong>Customer:</strong> {order.customerName}</p>
            <p><strong>Email:</strong> {order.customerEmail}</p>
            <p><strong>Phone:</strong> {order.customerPhone}</p>
            <p><strong>Total Amount:</strong> ₦{Number(order.totalAmount).toFixed(2)}</p>
            <p>
              <strong>Status:</strong>
              <select
                value={order.status}
                onChange={(e) =>
                  handleStatusUpdate(String(order._id), e.target.value as "pending" | "completed")
                }
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </p>
            <p><strong>Transaction Date:</strong> {new Date(order.createdAt).toLocaleDateString("en-GB")}</p>


            <p><strong>Products:</strong></p>
            <ul>
              {order.products.map((item) => {
                const product = typeof item.product === "string" ? { name: "Unknown Product", _id: item.product } : item.product;
                return (
                  <li className="item-list" key={product._id}>
                    {product.name} - {item.quantity}
                  </li>
                );
              })}
            </ul>
            <div className={styles.orderButton}>
            <button className={styles.deleteButton} onClick={() => handleDeleteOrder(String(order._id))}>
              Delete
            </button>

            <button className={styles.downloadButton} onClick={() => generatePDF(order)}>
              Download PDF
            </button>
            </div>

            
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Orders;
