import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Flame, ArrowLeft } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center p-6">
    <div className="text-center space-y-6 animate-fade-in">
      <div className="w-24 h-24 rounded-3xl gradient-hot flex items-center justify-center mx-auto shadow-glow animate-float">
        <Flame className="w-12 h-12 text-white" />
      </div>
      <div>
        <h1 className="text-6xl font-black text-gradient-flame">404</h1>
        <p className="text-lg font-semibold mt-2">Page Not Found</p>
        <p className="text-sm text-muted-foreground mt-1">Looks like you swiped too far 😅</p>
      </div>
      <Link to="/">
        <Button className="gradient-hot border-0 text-white rounded-2xl h-12 px-6 shadow-elevated hover:shadow-glow">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Swiping
        </Button>
      </Link>
    </div>
  </div>
);

export default NotFound;
