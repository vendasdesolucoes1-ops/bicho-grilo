import * as lucide from "lucide-react";
const icons = ["MessageSquare", "ChevronRight", "Search", "Plus", "Trash2", "Clock", "FolderHeart", "Activity", "CheckCircle2", "CreditCard", "Zap", "AlertCircle", "Sparkles", "Building", "Users"];
icons.forEach(i => {
  if (!lucide[i]) console.log("Missing:", i);
});
