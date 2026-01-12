import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

const FilterSidebar = ({ onFilterChange, brands, categories }) => {
    const [filters, setFilters] = useState({ brandId: 0, categoryId: 0, size: '', searchTerm: '' });

    const handleReset = () => {
        const defaultFilters = { brandId: 0, categoryId: 0, size: '', searchTerm: '' };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters); // Sync with parent
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Convert ID values to numbers since they come from the event as strings
        const processedValue = (name === 'brandId' || name === 'categoryId') ? parseInt(value) : value;
        
        const newFilters = { ...filters, [name]: processedValue };
        setFilters(newFilters);
        onFilterChange(newFilters); 
    };

    return (
        <div className="py-3 mb-4">
            <Form className="w-100">
                <div className="d-flex align-items-center gap-3">

                    {/* Category Dropdown */}
                    <Form.Select
                        name="categoryId"
                        value={filters.categoryId} // Controlled component
                        onChange={handleChange}
                        style={{ fontSize: '0.9rem', minWidth: '140px', height: '36px' }}
                    >
                        <option value={0}>All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </Form.Select>

                    {/* Brand Dropdown */}
                    <Form.Select
                        name="brandId"
                        value={filters.brandId} // Controlled component
                        onChange={handleChange}
                        style={{ fontSize: '0.9rem', minWidth: '140px', height: '36px' }}
                    >
                        <option value={0}>All Brands</option>
                        {brands.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </Form.Select>

                    {/* Size Dropdown */}
                    <Form.Select
                        name="size"
                        value={filters.size} // Controlled component
                        onChange={handleChange}
                        style={{ fontSize: '0.9rem', minWidth: '100px', height: '36px' }}
                    >
                        <option value="">All Sizes</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                    </Form.Select>

                    {/* Search Bar */}
                    <Form.Control
                        type="text"
                        name='searchTerm'
                        placeholder="Search product name..."
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
                            color: '#555'
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