import { Mail, Phone, Clock, MapPin } from "lucide-react";

export const metadata = {
  title: "যোগাযোগ",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="font-display mb-2 text-3xl font-semibold text-foreground">
        যোগাযোগ
      </h1>
      <p className="mb-10 text-muted">
        প্রশ্ন, অর্ডার সহায়তা বা সহযোগিতার জন্য আমাদের সাথে যোগাযোগ করুন।
      </p>

      <div className="space-y-4">
        {[
          { icon: Phone, label: "ফোন / WhatsApp", value: "01700-000000" },
          { icon: Mail, label: "ইমেইল", value: "hello@shishirkunjo.com" },
          { icon: Clock, label: "সময়", value: "শনি–বৃহস্পতি, সকাল ১০টা – সন্ধ্যা ৬টা" },
          { icon: MapPin, label: "সেবা এলাকা", value: "সারা বাংলাদেশে ডেলিভারি" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-start gap-4 rounded-craft-md border border-border bg-card p-5 shadow-organic"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-craft-sm bg-secondary">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium tracking-wide text-muted uppercase">
                {item.label}
              </p>
              <p className="mt-0.5 font-medium text-foreground">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
