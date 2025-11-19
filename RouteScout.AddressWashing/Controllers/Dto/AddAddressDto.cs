// =======================
// File: Controllers/AddressWashingController.cs
// =======================
namespace RouteScout.AddressWashing.Controllers.Dto;

public record AddAddressDto(string RawAddress, Guid? PaymentId, int Amount);