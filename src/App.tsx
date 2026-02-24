import { Outlet } from "react-router";
import Navbar from "./components/BasicComponents/Navbar/Navbar";
import Footer from "./components/BasicComponents/Footer/Footer";

function App() {
  return (
    <>
      <div className="poppins-regular relative z-10 bg-white">
        <Navbar></Navbar>
        <Outlet></Outlet>
      </div>
      <Footer></Footer>
    </>
  );
}

export default App;
