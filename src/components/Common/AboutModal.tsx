import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FaGithub,
  FaLinkedin,
  FaBlog,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
} from "react-icons/fa";

interface LinkRowProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  display: string;
}

function LinkRow({ icon, label, href, display }: LinkRowProps) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel="noreferrer"
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-muted"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block truncate font-medium text-foreground">{display}</span>
      </span>
    </a>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs text-muted-foreground">{label}</span>
        <span className="block text-sm font-medium text-foreground">{value}</span>
      </span>
    </div>
  );
}

interface AboutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutModal({ open, onOpenChange }: AboutModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="pb-2">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-2xl font-bold shadow-md">
            HK
          </div>
          <DialogTitle className="text-center text-xl">Hari Krishna Anem</DialogTitle>
          <p className="text-center text-sm text-muted-foreground">Full-Stack Developer</p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card">
            <InfoRow icon={<FaGraduationCap size={14} />} label="Education" value="B.Tech (CSIT)" />
            <div className="mx-3 border-t border-border" />
            <InfoRow
              icon={<FaMapMarkerAlt size={14} />}
              label="Location"
              value="Hyderabad, India"
            />
          </div>

          <div className="rounded-xl border border-border bg-card">
            <LinkRow
              icon={<FaPhone size={13} />}
              label="Phone"
              href="tel:+919885699666"
              display="+91 98856 99666"
            />
            <div className="mx-3 border-t border-border" />
            <LinkRow
              icon={<FaEnvelope size={13} />}
              label="Email"
              href="mailto:anemharikrishna@gmail.com"
              display="anemharikrishna@gmail.com"
            />
          </div>

          <div className="rounded-xl border border-border bg-card">
            <LinkRow
              icon={<FaGithub size={15} />}
              label="GitHub"
              href="https://github.com/HariKrishna-9885699666"
              display="HariKrishna-9885699666"
            />
            <div className="mx-3 border-t border-border" />
            <LinkRow
              icon={<FaLinkedin size={15} />}
              label="LinkedIn"
              href="https://linkedin.com/in/anemharikrishna"
              display="anemharikrishna"
            />
            <div className="mx-3 border-t border-border" />
            <LinkRow
              icon={<FaBlog size={15} />}
              label="Blog"
              href="https://hashnode.com/@HariKrishna-9885699666"
              display="hashnode.com/@HariKrishna"
            />
            <div className="mx-3 border-t border-border" />
            <LinkRow
              icon={<FaGlobe size={15} />}
              label="Portfolio"
              href="https://harikrishna.is-a-good.dev"
              display="harikrishna.is-a-good.dev"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
