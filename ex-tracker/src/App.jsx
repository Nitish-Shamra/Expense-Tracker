import { createBrowserRouter, RouterProvider,} from "react-router";
import Transactions from './components/transactions';
import Navbar from './components/Navbar';
import './App.css'
import Download from './components/Download';
import About from './components/About';
import Contact from './components/Contact';


function App() {
  let router = createBrowserRouter([
    {
      path: "/",
      element: (
        <>
          <Navbar />
          <Transactions />
        </>
      ),
    },
    {
      path: "/download",
      element: (
        <>
          <Navbar />
          <Download />
        </>
      ),
    },
    {
      path: "/about",
      element: (
        <>
          <Navbar />
          <About />
        </>
      ),
    },
    {
      path: "/contact us",
      element: (
        <>
          <Navbar />
          <Contact />
        </>
      ),
    },
  ]);

 
  
  
  return (
    <>
     <RouterProvider router={router} />
  </>
  )
}

export default App
