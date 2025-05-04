import React from 'react';
import { Pagination } from "react-bootstrap";

function PaginationStaffComponent({ paginationInfo, loading, handlePageChange }) {
    return (
        <Pagination>
        <Pagination.First 
          onClick={() => handlePageChange(1)} 
          disabled={!paginationInfo.hasPrevPage || loading}
        />
        <Pagination.Prev
          onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
          disabled={!paginationInfo.hasPrevPage || loading}
        />
        {[...Array(paginationInfo.totalPages).keys()].map((page) => (
          <Pagination.Item
            key={page + 1}
            active={page + 1 === paginationInfo.currentPage}
            onClick={() => handlePageChange(page + 1)}
            disabled={loading}
          >
            {page + 1}
          </Pagination.Item>
        ))}
        <Pagination.Next
          onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
          disabled={!paginationInfo.hasNextPage || loading}
        />
        <Pagination.Last 
          onClick={() => handlePageChange(paginationInfo.totalPages)} 
          disabled={!paginationInfo.hasNextPage || loading}
        />
      </Pagination>
      )
}

export default PaginationStaffComponent;