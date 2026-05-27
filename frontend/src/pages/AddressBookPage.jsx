import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { getCurrentUser, addAddress, updateAddress, deleteAddress } from "../services/authService.js";

function AddressBookPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    label: "Home",
    fullName: "",
    addressLine1: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
    isDefault: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await getCurrentUser();
      setAddresses(response.data.data.savedAddresses || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAddresses();
  }, [user]);

  const resetForm = () => {
    setFormData({
      label: "Home",
      fullName: "",
      addressLine1: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      let response;
      if (editingId) {
        response = await updateAddress(editingId, formData);
        toast.success("Address updated!");
      } else {
        response = await addAddress(formData);
        toast.success("Address added!");
      }
      setAddresses(response.data.data);
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      label: address.label || "Home",
      fullName: address.fullName,
      addressLine1: address.addressLine1,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone || "",
      isDefault: address.isDefault || false,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    try {
      const response = await deleteAddress(addressId);
      setAddresses(response.data.data);
      toast.success("Address deleted.");
    } catch {
      toast.error("Failed to delete address.");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const response = await updateAddress(addressId, { isDefault: true });
      setAddresses(response.data.data);
      toast.success("Default address updated.");
    } catch {
      toast.error("Failed to set default.");
    }
  };

  if (loading) {
    return (
      <section className="section-block">
        <div className="container">
          <Loader />
        </div>
      </section>
    );
  }

  return (
    <section className="section-block">
      <div className="container">
        <div className="section-heading">
          <span className="eyebrow">Account</span>
          <h1>Address Book</h1>
        </div>

        <button
          type="button"
          className="primary-button"
          style={{ marginBottom: "2rem" }}
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          + Add New Address
        </button>

        {showForm ? (
          <div className="address-form-card">
            <h3>{editingId ? "Edit Address" : "New Address"}</h3>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="checkout-grid">
                <label className="form-field">
                  <span>Label</span>
                  <select name="label" value={formData.label} onChange={handleChange}>
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </label>

                <label className="form-field">
                  <span>Full Name</span>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full name" />
                </label>

                <label className="form-field">
                  <span>Address</span>
                  <input type="text" name="addressLine1" value={formData.addressLine1} onChange={handleChange} placeholder="Street address" />
                </label>

                <label className="form-field">
                  <span>City</span>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
                </label>

                <label className="form-field">
                  <span>State</span>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
                </label>

                <label className="form-field">
                  <span>Postal Code</span>
                  <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code" />
                </label>

                <label className="form-field">
                  <span>Country</span>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country" />
                </label>

                <label className="form-field">
                  <span>Phone</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone (optional)" />
                </label>
              </div>

              <label className="form-field checkbox-field">
                <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} />
                <span>Set as default address</span>
              </label>

              <div className="address-form-actions">
                <button type="submit" className="primary-button" disabled={submitting}>
                  {submitting ? "Saving..." : editingId ? "Update Address" : "Save Address"}
                </button>
                <button type="button" className="secondary-button" onClick={resetForm}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {addresses.length === 0 && !showForm ? (
          <div className="empty-state-panel">
            <h2>No saved addresses</h2>
            <p>Add your shipping addresses for faster checkout.</p>
          </div>
        ) : (
          <div className="address-grid">
            {addresses.map((address) => (
              <div key={address._id} className={`address-card ${address.isDefault ? "address-default" : ""}`}>
                <div className="address-card-header">
                  <span className="address-label">{address.label}</span>
                  {address.isDefault ? <span className="address-default-badge">Default</span> : null}
                </div>
                <h4>{address.fullName}</h4>
                <p>{address.addressLine1}</p>
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                {address.phone ? <p>📞 {address.phone}</p> : null}

                <div className="address-card-actions">
                  <button type="button" className="text-button" onClick={() => handleEdit(address)}>Edit</button>
                  <button type="button" className="text-button danger" onClick={() => handleDelete(address._id)}>Delete</button>
                  {!address.isDefault ? (
                    <button type="button" className="text-button" onClick={() => handleSetDefault(address._id)}>Set Default</button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default AddressBookPage;
