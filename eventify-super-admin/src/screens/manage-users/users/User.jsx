import { useState, useEffect } from "react";
import "../../../styles/global.styles.css";
import "./User.css";
import { useDispatch, useSelector } from "react-redux";
import { getUsers } from "../../../redux/slices/user.slice";
import InputField from "../../../utilities/InputField/InputField.utility";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utilities/Loader/Loader.utility";

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const users = useSelector((state) => state.users.users);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getUsers())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredUsers = (Array.isArray(users) ? users : []).filter(
    (u) =>
      (u.userName && u.userName.toLowerCase().includes(search.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSearch = (e) => setSearch(e.target.value);

  const handleViewDetail = (u) => {
    navigate(`/super-admin/users/manage-users/user-details/${u._id}`, {
      state: { user: u },
    });
  };

  return (
    <section id="users">
      <div className="users-container">
        <h2 className="users-title">Users List</h2>

        <div className="users-header">
          <div className="mt-4">
            <InputField
              type="text"
              placeholder="Search Users"
              value={search}
              onChange={handleSearch}
              width={300}
            />
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loader-container">
              <Loader />
            </div>
          ) : filteredUsers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr className="table-header-row">
                  <th>Name</th>
                  <th>Email</th>
                  <th style={{ textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.userName || "N/A"}</td>
                    <td>{u.email || "N/A"}</td>
                    <td className="actions">
                      <button
                        className="action-btn view-detail-btn"
                        onClick={() => handleViewDetail(u)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-users-found">
              <i className="fas fa-user-slash"></i>
              <p>No Users Found</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Users;
