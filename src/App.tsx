import { Outlet } from "react-router";
import Navbar from "./components/BasicComponents/Navbar/Navbar";
import Footer from "./components/BasicComponents/Footer/Footer";

function App() {
  return (
    <>
      
        <Navbar></Navbar>
        <Outlet></Outlet>
    
      <Footer></Footer>
    </>
  );
}

export default App;
