﻿using System.Collections.ObjectModel;

namespace Store.Domain.Entities;

public class Client : Entity
{
    public string Cpf { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
    
    // EF Relation
    public Collection<Product> Products { get; set; } = new();
}