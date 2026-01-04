import  { useState,useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

type AutoCompleteProps<T> = {
  items: T[];
  selectedItem: T | null;
  onSelect: (item: T) => void;
  getItemId: (item: T) => number | string;
  getItemLabel: (item: T) => string;
  placeholder?: string;
  height?: number;
disabled?:boolean;
 // error?: string;
};

function AutoComplete<T>({
  items,
  selectedItem,
  onSelect,
  getItemId,
  getItemLabel,
  placeholder = "בחר...",
  height = 3,
  disabled = false,

}: AutoCompleteProps<T>) { 
   const [searchText, setSearchText] = useState(
    selectedItem ? getItemLabel(selectedItem) : ""
  );

     useEffect(() => {
    if (selectedItem) {
      setSearchText(getItemLabel(selectedItem));
    } else {
      setSearchText("");
    }
  }, [selectedItem]);


  const [isOpen, setIsOpen] = useState(false);
  const filteredItems =
   items.filter((item) =>
    getItemLabel(item).toLowerCase().includes(searchText.toLowerCase())
  );
  const handleSelect = (item: T) => {
    setSearchText(getItemLabel(item));
    setIsOpen(false);
    onSelect(item);
  };

  const handleToggle = () => {
    setSearchText("");
    setIsOpen(!isOpen);
    // if (isOpen) 
  };

  return (
 
    <div className="relative w-full">
        
      {/* {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )} */}
      <input
      disabled={disabled}
        type="text"
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsOpen(true);
        }}
        placeholder={placeholder}
        className={`w-full p-${height}  rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
          `border-gray-300 ${disabled ? " bg-gray-50" : "border border-gray-300 "}`
        }`}
      />
      <button
       disabled={disabled}
        type="button"
        onClick={handleToggle}
        className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 hover:text-purple-600"
      >
        <ChevronDownIcon className="h-6 w-6" />
      </button>
      {isOpen && filteredItems.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filteredItems.map((item) => (
            <li
              key={getItemId(item)}
              onClick={() => handleSelect(item)}
              className="p-2 cursor-pointer hover:bg-[#0078d7] hover:text-white"
            >
              {getItemLabel(item)}
            </li>
          ))}
        </ul>
      )}
      {/* {error && <p className="text-red-500 text-sm mt-1">{error}</p>} */}
    </div>
  );
}

export default AutoComplete;