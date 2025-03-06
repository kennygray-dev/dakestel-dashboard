import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./CreateOrder.module.scss"; // Import the SCSS file

interface Product {
  _id: string;
  name: string;
  price: number;
}

const CreateOrder: React.FC = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    products: [{ product: "", quantity: 0 }],
    totalAmount: 0,
    status: "pending",
  });

  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  // Handle input change for customer fields
  const handleCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle input change for product fields
  const handleProductChange = (index: number, field: string, value: string | number) => {
    const updatedProducts = [...formData.products];
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setFormData({ ...formData, products: updatedProducts });

    // Recalculate total amount when quantity changes
    if (field === "quantity") {
      const selectedProduct = products.find((p) => p._id === updatedProducts[index].product);
      if (selectedProduct) {
        const totalAmount = updatedProducts.reduce((sum, item) => {
          const product = products.find((p) => p._id === item.product);
          return sum + (product ? product.price * item.quantity : 0);
        }, 0);
        setFormData((prevData) => ({ ...prevData, totalAmount }));
      }
    }
  };

  // Add a new product field
  const handleAddProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { product: "", quantity: 0 }],
    });
  };

  // Remove a product field
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({ ...formData, products: updatedProducts });

    // Recalculate total amount after removing a product
    const totalAmount = updatedProducts.reduce((sum, item) => {
      const product = products.find((p) => p._id === item.product);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    setFormData((prevData) => ({ ...prevData, totalAmount }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone || formData.products.length === 0) {
      alert("Please fill out all required fields and add at least one product.");
      return;
    }

    // Prepare the payload
    const payload = {
      ...formData,
    };

    console.log("Payload being sent:", payload); // Debugging

    try {
      const response = await axios.post("http://localhost:5000/api/orders", payload);
      alert("Order created successfully!");
      console.log(response.data);
      navigate("/orders"); // Redirect to the Orders page
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error response:", error.response?.data);
        alert(error.response?.data.message || "Error creating order");
      } else {
        alert("An unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.createOrderContainer}>
      <h2>Create New Order</h2>

      {/* Customer Name */}
      <div>
        <label>Customer Name:</label>
        <input
          type="text"
          name="customerName"
          value={formData.customerName}
          onChange={handleCustomerChange}
          required
        />
      </div>

      {/* Customer Email */}
      <div>
        <label>Customer Email:</label>
        <input
          type="email"
          name="customerEmail"
          value={formData.customerEmail}
          onChange={handleCustomerChange}
          required
        />
      </div>

      {/* Customer Phone */}
      <div>
        <label>Customer Phone:</label>
        <input
          type="text"
          name="customerPhone"
          value={formData.customerPhone}
          onChange={handleCustomerChange}
          required
        />
      </div>

      {/* Products */}
      <div>
        <label>Products:</label>
        {formData.products.map((product, index) => (
          <div key={index} className={styles.productRow}>
            <select
              value={product.product}
              onChange={(e) => handleProductChange(index, "product", e.target.value)}
              required
            >
              <option value="">Select a product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} (₦{p.price})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Quantity"
              value={product.quantity}
              onChange={(e) => handleProductChange(index, "quantity", parseInt(e.target.value))}
              required
              min="1"
            />
            <button
              type="button"
              onClick={() => handleRemoveProduct(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddProduct} className={styles.addProductButton}>
          Add Product
        </button>
      </div>

      {/* Total Amount */}
      <div className={styles.totalAmount}>
  <label>Total Amount:</label>
  <input
    type="text"
    name="totalAmount"
    value={`₦${formData.totalAmount}`}
    readOnly
  />
</div>


      {/* Submit Button */}
      <button type="submit" className={styles.submitButton}>
        Create Order
      </button>
    </form>
  );
};

export default CreateOrder;