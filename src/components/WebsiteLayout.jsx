import BottomBar from "./BottomBar";
// import TopBar from "./TopBar";

export default function WebsiteLayout({ children }) {
    return (
        <>
            <div className="bg-primary p-2">
                <h1 className="text-white font-semibold text-3xl text-center">Jio</h1>
            </div>

            <main className="bg-gray-100 min-h-screen pb-20">
                {children}
            </main>
            <BottomBar />
        </>
    );
}