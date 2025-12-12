import {
  CircleDollarSignIcon,
  TicketIcon,
  CalendarCheck2,
  UserPlusIcon,
  StarIcon,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Loading from "../../components/Loading";
import useApi from "../../hooks/useApi";
import BlurCircle from "../../components/BlurCircle";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const api = useApi(true);
  const currency = import.meta.env.VITE_CURRENCY;

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    cards: {},
    doanhThu7Ngay: [],
    doanhThuTheoThang: [],
    topPhimTuan: [],
  });

  // FILTER
  const [filterType, setFilterType] = useState("7days");
  const [filterResult, setFilterResult] = useState(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard");
      setDashboard(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilter = async () => {
    if (filterType === "7days") {
      setFilterResult(null);
      return;
    }

    try {
      const res = await api.get("/admin/dashboard/filter", {
        params: { type: filterType, from, to, month, year },
      });
      setFilterResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchFilter();
  }, [filterType, from, to, month, year]);



  // DATA CHO BIỂU ĐỒ
  const chartData = {
    labels: (filterResult?.data ?? dashboard.doanhThu7Ngay).map(x => x.label || x.ngay),
    datasets: [
      {
        label: "Doanh thu",
        data: (filterResult?.data ?? dashboard.doanhThu7Ngay).map(x => x.tong),
        borderWidth: 3,
        tension: 0.3,
        borderColor: "#20B2AA",
        backgroundColor: "rgba(74,222,128,0.15)",
        pointBackgroundColor: "#00868B",
        pointBorderColor: "#fff",
        pointRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)"
        }
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)"
        }
      }
    }
  }



  const Card = ({ icon, label, value, color }) => (
    <div className="p-6 bg-black rounded-xl border border-primary shadow-md">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
          {icon}
        </div>
        <p className="text-gray-400 text-lg">{label}</p>
      </div>
      <h2 className="text-2xl font-bold mt-1 text-center">{value}</h2>
    </div>
  );

  if (loading) return <Loading />;

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-semibold mb-6">Tổng quan • GoCinema</h1>

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card
          icon={<CircleDollarSignIcon />}
          label="Doanh thu hôm nay"
          value={dashboard.cards.doanhThuHomNay.toLocaleString() + " " + currency}
          color="text-green-500"
        />
        <Card
          icon={<TicketIcon />}
          label="Vé bán hôm nay"
          value={dashboard.cards.veBanHomNay}
          color="text-blue-500"
        />
        <Card
          icon={<CalendarCheck2 />}
          label="Suất chiếu hôm nay"
          value={dashboard.cards.suatChieuHomNay}
          color="text-yellow-500"
        />
        <Card
          icon={<UserPlusIcon />}
          label="Người dùng mới"
          value={dashboard.cards.userMoi}
          color="text-gray-500"
        />
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-6 items-center">
        <select
          value={filterType}
          className="bg-black border border-primary px-3 py-2 rounded"
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="7days">7 ngày gần nhất</option>
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
          <option value="date">Tùy chọn ngày</option>
        </select>

        {filterType === "month" && (
          <>
            <select
              onChange={(e) => setMonth(e.target.value)}
              className="bg-black border px-3 py-2 rounded"
            >
              <option value="">Chọn tháng</option>
              {[...Array(12)].map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>

            <input
              type="number"
              placeholder="Năm"
              className="bg-black border px-3 py-2 rounded w-32"
              onChange={(e) => setYear(e.target.value)}
            />
          </>
        )}

        {filterType === "year" && (
          <input
            type="number"
            placeholder="Năm"
            className="bg-black border px-3 py-2 rounded w-32"
            onChange={(e) => setYear(e.target.value)}
          />
        )}

        {filterType === "date" && (
          <>
            <input
              type="date"
              className="bg-black border px-3 py-2 rounded"
              onChange={(e) => setFrom(e.target.value)}
            />
            <input
              type="date"
              className="bg-black border px-3 py-2 rounded"
              onChange={(e) => setTo(e.target.value)}
            />
          </>
        )}
      </div>



      {/* BIỂU ĐỒ */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="bg-black border border-primary p-6 rounded-xl flex-2">
          <h2 className="text-xl mb-4 font-semibold">
            {filterType === "7days"
              ? "Doanh thu 7 ngày gần nhất"
              : "Doanh thu • Kết quả lọc"}
          </h2>

          <Line data={chartData} options={chartOptions} />
        </div>

        {/* TOP PHIM */}
        <div className="bg-black border border-primary rounded-xl p-6 flex-1">
          <h2 className="text-xl mb-4 font-semibold flex items-center gap-2">
            <StarIcon /> Top phim bán chạy tuần
          </h2>

          <ul className="space-y-4">
            {dashboard.topPhimTuan.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <img
                  src={item.poster}
                  className="w-12 h-16 rounded object-cover border"
                />
                <div>
                  <p className="text-lg font-medium">
                    {item.tenPhim}
                  </p>
                  <p className="text-gray-400">Vé bán: {item.soVe}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BlurCircle top="200px" right="-10%" />
    </div>
  );
};

export default Dashboard;
