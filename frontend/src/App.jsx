import { Navbar } from "./components/Navbar";
import { Outlet, useNavigation } from "react-router";
import PageLoader from "./components/PageLoader";

function App() {
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";
  return (
    <div className="w-screen min-h-screen bg-[#0F172A]">
      <Navbar />

      <main className="flex-1 flex justify-center items-center">
        <Outlet />
      </main>
      {isLoading && <PageLoader />}
    </div>
  );
}

export default App;
