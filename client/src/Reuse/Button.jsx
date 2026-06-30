import { Link } from "react-router-dom";

const Button = ({
  text,
  variant = "primary",
  onClick,
  to,
  className = "", 
}) => {
  const baseClassName = `inline-block px-5 py-2 rounded-xl font-semibold transition duration-300 ${
    variant === "primary"
      ? "bg-[#EA590D] cursor-pointer text-white hover:bg-orange-600"
      : "border border-[#EA590D] text-[#EA590D] hover:bg-orange-50"
  } ${className}`;

  if (to) {
    return (
      <Link to={to} onClick={onClick} className={baseClassName}>
        {text}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseClassName}>
      {text}
    </button>
  );
};

export default Button;