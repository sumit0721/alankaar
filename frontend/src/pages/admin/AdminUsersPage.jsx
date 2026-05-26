import { useEffect, useState } from "react";

import AdminModal from "../../components/admin/AdminModal.jsx";
import AdminTable from "../../components/admin/AdminTable.jsx";
import Loader from "../../components/common/Loader.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  deleteAdminUser,
  getAdminUsers,
  toggleAdminRole,
  toggleUserActive,
} from "../../services/adminService.js";

const PAGE_SIZE = 20;

function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mutationLoading, setMutationLoading] = useState(false);
  const [error, setError] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAdminUsers({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch,
      });
      setUsers(response.data.data);
      setPages(response.data.pages || 1);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load users right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadUsers();
  }, [debouncedSearch, page]);

  const isOwnAccount = (rowUser) => rowUser._id === user?._id;

  const handleToggleRole = async (rowUser) => {
    try {
      setMutationLoading(true);
      await toggleAdminRole(rowUser._id);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update user role.");
    } finally {
      setMutationLoading(false);
    }
  };

  const handleToggleActive = async (rowUser) => {
    try {
      setMutationLoading(true);
      await toggleUserActive(rowUser._id);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update user status.");
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) {
      return;
    }

    try {
      setMutationLoading(true);
      await deleteAdminUser(userToDelete._id);
      setUserToDelete(null);
      await loadUsers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete user.");
    } finally {
      setMutationLoading(false);
    }
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    {
      key: "admin",
      label: "Role",
      render: (rowUser) => (
        <span className={rowUser.isAdmin ? "admin-badge green" : "admin-badge amber"}>
          {rowUser.isAdmin ? "Admin" : "Customer"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (rowUser) => {
        const active = rowUser.isActive !== false;
        return (
          <span className={active ? "admin-badge green" : "admin-badge red"}>
            {active ? "Active" : "Blocked"}
          </span>
        );
      },
    },
    {
      key: "orders",
      label: "Orders",
      render: (rowUser) => rowUser.orderCount || 0,
    },
    {
      key: "joined",
      label: "Joined",
      render: (rowUser) => new Date(rowUser.createdAt).toLocaleDateString("en-IN"),
    },
    {
      key: "actions",
      label: "Actions",
      render: (rowUser) => {
        const ownAccount = isOwnAccount(rowUser);
        const active = rowUser.isActive !== false;

        return (
          <div className="admin-row-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => handleToggleRole(rowUser)}
              disabled={ownAccount || mutationLoading}
              title={ownAccount ? "Cannot modify your own account" : ""}
            >
              Toggle Admin
            </button>
            <button
              type="button"
              className={active ? "danger-button" : "primary-button"}
              onClick={() => handleToggleActive(rowUser)}
              disabled={ownAccount || mutationLoading}
              title={ownAccount ? "Cannot block yourself" : ""}
            >
              {active ? "Block" : "Unblock"}
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={() => setUserToDelete(rowUser)}
              disabled={ownAccount || mutationLoading}
              title={ownAccount ? "Cannot modify your own account" : ""}
            >
              Delete
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="admin-top-bar">
        <div>
          <span className="eyebrow">Customers</span>
          <h1>Users</h1>
        </div>
        <input
          className="admin-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name or email"
        />
      </div>

      {error ? <p className="status-message error-message">{error}</p> : null}
      {loading ? <Loader /> : null}

      {!loading ? (
        <>
          <AdminTable columns={columns} rows={users} emptyMessage="No users found." />

          <div className="admin-pagination">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span>Page {page} of {pages}</span>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setPage((current) => Math.min(current + 1, pages))}
              disabled={page === pages}
            >
              Next
            </button>
          </div>
        </>
      ) : null}

      {userToDelete ? (
        <AdminModal
          title="Delete user"
          message={`Delete ${userToDelete.name}? Their account will no longer be available.`}
          confirmLabel="Delete"
          loading={mutationLoading}
          onCancel={() => setUserToDelete(null)}
          onConfirm={handleDelete}
        />
      ) : null}
    </>
  );
}

export default AdminUsersPage;
