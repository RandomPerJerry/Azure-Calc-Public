function DataInput({type, data, setData, options = {}}) {

  const updateData = (e) => {
    const inputVal = e.target.value;
    if (type === "string" || type === "textarea") {
      setData(inputVal);
    } else if (type === "number") {
      const createdValue = (inputVal === "") ? "" : Number(inputVal);
      setData(createdValue);
    }
  }

  // Default options
  const {
    placeholder = "",
    label = "",
    disabled = false,
    required = false,
    min,
    max,
    step,
    rows = 4,
    cols,
    resize = "vertical",
    unit = "", 
    prefix = "" 
  } = options;

  return (
    <div className={`data-input ${type}`}>
      {label && <label>{label}</label>}
      
      <div 
        className="input-with-prefix-unit"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        {prefix && (
          <span 
            className="prefix"
            style={{
              fontSize: '14px',
              color: '#666',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              margin: 0,
              padding: 0,
              flexShrink: 0
            }}
          >
            {prefix}
          </span>
        )}
        
        {type === "textarea" ? (
          <textarea
            value={data}
            onChange={updateData}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            cols={cols}
            style={{ 
              resize,
              flex: 1,
              margin: 0
            }}
          />
        ) : (
          <input
            type={type === "number" ? "number" : "text"}
            value={data}
            onChange={updateData}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            min={type === "number" ? min : undefined}
            max={type === "number" ? max : undefined}
            step={type === "number" ? step : undefined}
            style={{
              flex: 1,
              margin: 0
            }}
          />
        )}
        
        {unit && (
          <span 
            className="unit"
            style={{
              fontSize: '14px',
              color: '#666',
              fontWeight: '500',
              whiteSpace: 'nowrap',
              margin: 0,
              padding: 0,
              flexShrink: 0
            }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}

export default DataInput;