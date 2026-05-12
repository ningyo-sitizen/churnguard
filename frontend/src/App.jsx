import { Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import SignUp from "./SignUp.jsx";
import OTP from "./OTP.jsx";
import NewAcc from "./NewAcc.jsx";
import Dashboard from "./Dashboard.jsx";
import Analytic from "./Analytic.jsx";
import TestAPI from "./TestAPI.jsx";
import LoginSuccess from "./LoginSuccess.jsx";
import LoginRegister from "./LoginRegister.jsx";
import AuthCheckUser from "./AuthCheckUser.jsx";
import Prediction from "./prediction.jsx";
import DashboardSA from "./DashboardSA.jsx";
import AnalyticSA from "./AnalyticSA.jsx";
import ApprovalSA from "./ApprovalSA.jsx";
import Approval from "./Approval.jsx";
import Profile from "./Profile.jsx";
import ProfileSA from "./ProfileSA.jsx";
import EditProfileSA from "./EditprofileSA.jsx";
import UserControlSA from "./UserControlSA.jsx";
import HistorySA from "./HistorySA.jsx";
import HistoryApprovalSA from "./HistoryApprovalSA.jsx";
import Logout from "./logout.jsx";
import LogoutAlert from "./logoutConfirm.jsx";
import Keterangan from "./Keterangan.jsx";
import KeteranganSA from "./KeteranganSA.jsx";
import HistoryApprovalDetail from "./HistoryApprovalDetail.jsx";
import { NotificationProvider } from "./NotificationContext.jsx";
import CostumerDetail from "./costumerDetail.jsx";
import Validation from "./validation.jsx";
import DashboardUser from "./dashboardUser.jsx";
import UploadData from "./UploadData.jsx"
import ValidasiProses from "./validasiProses.jsx";
import DashboardDetail from "./DashboardDetail.jsx";
import Member from "./member.jsx";
import MemberPayment from "./memberPayment.jsx";
import Feedback from "./Feedback.jsx";
import RiwayatPrediksi from "./RiwayatPrediksi.jsx";
import LandingPage from "./LandingPage.jsx";
import AnalisisUlasan from "./AnalisisUlasan.jsx";
import DashboarHistory from "./DashboardHistory.jsx";


export default function App() {
  return (
    <NotificationProvider>
      <Routes>
        <Route path="/dashboardhistory" element = {<DashboarHistory />} />
        <Route path="/analisisUlasan" element = {<AnalisisUlasan />} />
        <Route path="/landingpage" element={<LandingPage />} />
        <Route path="/dashboardUser" element={<DashboardUser />} />
        <Route path="/uploadData" element={<UploadData />} />
        <Route path="/validasiproses" element={<ValidasiProses />} />
        <Route path="/dashboardDetail" element={<DashboardDetail />} />
        <Route path="/member" element={<Member />} />
        <Route path="/memberPayment" element={<MemberPayment />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/riwayatPrediksi" element={<RiwayatPrediksi />} />
        <Route path="/costumerdetail" element={<CostumerDetail />} />
        <Route path="/validation" element={<Validation />} />
        <Route path="/test" element={<TestAPI />} />
        <Route path="/login-success" element={<LoginSuccess />} />
        <Route path="/login-register" element={<LoginRegister />} />
        <Route path="/auth-check" element={<AuthCheckUser />} />
        <Route path="/prediction" element={<Prediction />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/newacc" element={<NewAcc />} />
        <Route path="/" element={<NewAcc />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/OTP" element={<OTP />} />
        <Route path="/NewAcc" element={<NewAcc />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/analytic" element={<Analytic />}></Route>
        <Route path="/Approval" element={<Approval />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="/dashboardSA" element={<DashboardSA />} />
        <Route path="/Keterangan/:nim" element={<Keterangan />} />
        <Route path="/analyticSA" element={<AnalyticSA />}></Route>
        <Route path="/approvalSA" element={<ApprovalSA />} />
        <Route path="/ProfileSA" element={<ProfileSA />} />
        <Route path="/edit-profileSA" element={<EditProfileSA />} />
        <Route path="/usercontrolSA" element={<UserControlSA />} />
        <Route path="/historySA" element={<HistorySA />} />
        <Route path="/historyapprovalSA" element={<HistoryApprovalSA />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/logoutConfirm" element={<LogoutAlert />} />
        <Route path="/KeteranganSA/:nim" element={<KeteranganSA />} />
        <Route path="/history/:batch_id" element={<HistoryApprovalDetail />}
        />
      </Routes>
    </NotificationProvider>
  );
}
