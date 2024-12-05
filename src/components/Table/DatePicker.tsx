import React from 'react';

interface DatePickerProps {
    id: string;
    value: Date | null;
    onChange: (date: Date) => void;
    className?: string;
    placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
    id,
    value,
    onChange,
    className = '',
    placeholder,
}) => {
    const defaultClassName = 'w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer';
    const combinedClassName = `${defaultClassName} ${className}`;

    return (
        <input
            id={id}
            type="date"
            className={combinedClassName}
            value={value ? value.toISOString().split('T')[0] : ''}
            onChange={(e) => onChange(new Date(e.target.value))}
            onClick={(e) => e.currentTarget.showPicker()}
            placeholder={placeholder}
        />
    );
};

export default DatePicker;