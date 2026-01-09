import React, { useEffect, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const FilterSidebar = ({ onFilterChange, brands, categories }) => {

    const [filters, setFilters] = useState({ brandId: 0, categoryId: 0, size: '', searchTerm: '' });
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = () => {
        const defaultFilters = { brandId: 0, categoryId: 0, size: '', searchTerm: '' };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters); // Update parent state without reload
        setIsResetting(true);
        setTimeout(() => setIsResetting(false), 100); // Briefly indicate reset
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilterChange(newFilters); // Send filters back to the parent component
    };

    return (
        <div className="py-3 mb-4">
            <Form className="w-100">
                <div className="d-flex align-items-center gap-3">

                    {/* Category Dropdown */}
                    <Form.Select
                        name="categoryId"
                        onChange={handleChange}
                        style={{ fontSize: '0.9rem', minWidth: '140px', height: '36px' }}
                    >
                        <option value={0} selected={isResetting}>All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Form.Select>

                    {/* Brand Dropdown */}
                    <Form.Select
                        name="brandId"
                        onChange={handleChange}
                        style={{ fontSize: '0.9rem', minWidth: '140px', height: '36px' }}
                    >
                        <option value={0} selected={isResetting}>All Brands</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </Form.Select>

                    {/* Size Dropdown */}
                    <Form.Select
                        name="size"
                        onChange={handleChange}
                        style={{ fontSize: '0.9rem', minWidth: '100px', height: '36px' }}
                    >
                        <option value="" selected={isResetting}>All Sizes</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                    </Form.Select>

                    {/* Search Bar */}
                    <Form.Control
                        type="text"
                        name='searchTerm'
                        placeholder="Search..."
                        className="flex-grow-1"
                        style={{ fontSize: '0.9rem', height: '36px' }}
                        value={filters.searchTerm}
                        onChange={handleChange}
                    />

                    {/* Reset Button */}
                    <Button
                        variant="light"
                        size="sm"
                        onClick={handleReset}
                        style={{
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            padding: '6px 14px',
                            border: '1px solid #ccc',
                            borderRadius: '20px',
                            backgroundColor: '#f8f9fa',
                            color: '#555',
                            transition: 'all 0.2s ease-in-out'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#e9ecef';
                            e.currentTarget.style.color = '#000';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#f8f9fa';
                            e.currentTarget.style.color = '#555';
                        }}
                    >
                        Reset
                    </Button>


                </div>
            </Form>
        </div>

    );
};

export default FilterSidebar;