import { FaCheckCircle } from "react-icons/fa";

export default function Input({ value, onChange, onDone, placeholder }) {
  return (
    <div className="nopan pointer-events inputContainer">
      <div>
        <input
          className="input"
          value={value}
          onChange={onChange}
          inputMode="numeric"
          placeholder={placeholder}
        />
      </div>
      <FaCheckCircle
        color="#03C03C"
        onClick={(e) => {
          e.stopPropagation();
          onDone();
        }}
      />
    </div>
  );
}
