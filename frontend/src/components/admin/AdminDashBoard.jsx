import {
  CircleDollarSignIcon,
  TicketIcon,
  CalendarCheck2,
  UserPlusIcon,
  StarIcon,
  Download,
} from "lucide-react";

import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import Loading from "../../components/Loading";
import useApi from "../../hooks/useApi";
import BlurCircle from "../../components/BlurCircle";
import aiIcon from '../../assets/ai.png';

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

const AdminDashboard = () => {
  const api = useApi(true);
  const currency = import.meta.env.VITE_CURRENCY;

  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState({
    cards: {},
    doanhThu7Ngay: [],
    doanhThuTheoThang: [],
    topPhimTuan: [],
  });

  const [raps, setRaps] = useState([])
  const [maRap, setMaRap] = useState("")

  // FILTER
  const [filterType, setFilterType] = useState("7days");
  const [filterResult, setFilterResult] = useState(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/dashboard", {
        params: { maRap }
      });
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

    if (filterType === "date" && (!from || !to)) {
      return;
    }

    if (filterType === "month" && (!month || !year)) return;
    if (filterType === "year" && !year) return;
    try {
      const res = await api.get("/admin/dashboard/filter", {
        params: { type: filterType, from, to, month, year, maRap },
      });
      setFilterResult(res.data);
    } catch (err) {
      console.log(err);
    }
  };



  useEffect(() => {
    const fetchRaps = async () => {
      const res = await api.get("/rap")
      setRaps(res.data.data)
    }
    fetchRaps()
  }, [])

  useEffect(() => {
    fetchData();
  }, [maRap]);

  useEffect(() => {
    fetchFilter();
  }, [filterType, from, to, month, year, maRap]);


  useEffect(() => {
    setFrom("");
    setTo("");
    setMonth("");
    setYear("");
  }, [filterType]);



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

  const sourceData = filterResult?.data ?? dashboard.doanhThu7Ngay;
  const topPhim = filterResult?.topPhim ?? dashboard.topPhimTuan;
  const analyzeRevenueByAI = async () => {
    try {
      setAiLoading(true);



      const res = await api.post("/ai/phan-tich-doanh-thu", {
        filterType,
        chartData: sourceData,
        topPhim,
        maRap
      });

      setAiAnalysis(res.data.analysis);
    } catch (err) {
      console.log(err);
    } finally {
      setAiLoading(false);
    }
  };


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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">

        <h1 className="text-3xl font-semibold mb-6 max-md:text-2xl">Tổng quan • GoCinema</h1>

        <div className="flex items-center gap-3 border border-primary px-4 py-2 rounded-lg cursor-pointer bg-primary-dull hover:bg-primary">
          <Download />

          Xuất báo cáo

        </div>
      </div>

      <select
        value={maRap}
        onChange={e => setMaRap(e.target.value)}
        className="bg-black border border-primary px-3 py-2 rounded mb-6"
      >
        <option value="">Tất cả rạp</option>
        {raps?.map(r => (
          <option key={r.maRap} value={r.maRap}>{r.tenRap}</option>
        ))}
      </select>


      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <Card
          icon={<CircleDollarSignIcon />}
          label="Doanh thu hôm nay"
          value={Number(dashboard.cards.doanhThu).toLocaleString("vi-VN") + " " + currency}
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
      <div className="flex flex-wrap gap-3 mb-6 items-center">
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
      <div className="flex flex-col lg:flex-row gap-3">
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
            <StarIcon />
            Top phim bán chạy
            {filterType !== "7days" && " (theo bộ lọc)"}
          </h2>

          <ul className="space-y-4">
            {topPhim.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <img
                  src={item.poster}
                  className="w-12 h-16 rounded object-cover border"
                />
                <div>
                  <p className="text-lg font-medium">
                    {item.tenPhim}
                  </p>
                  <p className="text-gray-400">
                    Vé bán: {item.soVe}
                  </p>
                  <p className="text-green-400 text-sm">
                    Doanh thu:{" "}
                    {Number(item.doanhThu).toLocaleString("vi-VN")} {currency}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5">
        <button
          onClick={analyzeRevenueByAI}
          className="bg-primary-dull px-4 py-2 rounded-lg hover:bg-primary cursor-pointer"
        >
          <img src={aiIcon} alt="AI Icon" className="w-6 h-6 inline-block mr-2" />
          Phân tích doanh thu bằng AI
        </button>

        {aiLoading && (
          <p className="text-gray-400 mt-3">
            AI đang phân tích dữ liệu...
          </p>
        )}

        {aiAnalysis && (
          <div className="mt-4 bg-black border border-primary rounded-xl p-4">
            <h3 className="font-semibold mb-2">
              Nhận xét từ AI
            </h3>

            <pre className="whitespace-pre-wrap text-gray-300 text-sm leading-relaxed">
              {aiAnalysis}
            </pre>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
