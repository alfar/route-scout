export interface AddressOption {
    id: string;
    label: string;
}

interface AddressSelectorProps {
    addresses: AddressOption[];
    selectedAddressId: string | null;
    onSelect: (addressId: string) => void;
}

export function AddressSelector({ addresses, selectedAddressId, onSelect }: AddressSelectorProps) {
    return (
        <div className="flex flex-col gap-1">
            {addresses.map(addr => (
                <button
                    key={addr.id}
                    className={`px-2 py-1 rounded ${selectedAddressId === addr.id ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-blue-100'}`}
                    onClick={() => onSelect(addr.id)}
                    disabled={selectedAddressId === addr.id}
                >
                    {addr.label}
                </button>
            ))}
        </div>
    );
}
