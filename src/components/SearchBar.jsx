import { useState } from "react";


function SearchBar({ suggestionsCallBack, onValueChange, placeholder }) {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onValueChange(value)
    suggestionsCallBack(value).then((suggestions) =>{
        console.log(suggestions)
        const normalized = suggestions.map(s => s.url)
        setFilteredSuggestions(normalized);
        setShowSuggestions(true);
    })
    
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onValueChange(suggestion)
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        placeholder={placeholder}
      />
      
      {showSuggestions && inputValue && (
        <div className="absolute z-10 mt-1 bg-white text-black border rounded shadow-lg h-auto max-h-50 w-full overflow-y-auto overflow-x-hidden  [scrollbar-width:none]">
          {filteredSuggestions.length > 0 ? (
            <ul>
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-2 hover:bg-gray-100 cursor-pointer scroll"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-gray-500">No entries found</div>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar