import { Link } from "react-router-dom";
import { Logo } from "../../components/Logo";

type BrandProps = {
  className?: string;
};

export const Brand = ({ className }: BrandProps) => {
  return (
    <Link
      to="/"
      className={
        "hbar-brand-icon d-flex align-items-center justify-content-center " +
        (className ?? "")
      }
    >
      <div className="my-lg-0 mw-100">
        <Logo size={30} />
      </div>
    </Link>
  );
};
