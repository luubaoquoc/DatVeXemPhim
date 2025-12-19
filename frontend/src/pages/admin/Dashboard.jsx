import { useSelector } from "react-redux";
import NhanVienDashBoard from "../../components/admin/NhanVienDashBoard";
import QuanLyDashBoard from "../../components/admin/QuanLyDashBoard";
import AdminDashboard from "../../components/admin/AdminDashBoard";

const Dashboard = () => {
  const { user } = useSelector(state => state.auth);

  if (!user) return null;

  switch (user.vaiTro) {
    case 2:
      return <NhanVienDashBoard />;
    case 3:
      return <QuanLyDashBoard />;
    case 4:
      return <AdminDashboard />;
    default:
      return null;
  }
};

export default Dashboard;
