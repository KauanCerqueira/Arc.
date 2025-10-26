﻿using Arc.Domain.Entities;

namespace Arc.Domain.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByIdAsync(Guid id);
    Task<User> CreateAsync(User user);
    Task<bool> EmailExistsAsync(string email);
    Task UpdateAsync(User user);
}
