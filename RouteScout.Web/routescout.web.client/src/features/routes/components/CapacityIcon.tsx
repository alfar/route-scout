import { TruckIcon } from "@heroicons/react/24/outline";
import { TrailerKind } from "./DraggableCapacityIcon";
import { useTranslation } from "react-i18next";

interface CapacityIconProps {
    kind: TrailerKind;
}

const CapacityIcon: React.FC<CapacityIconProps> = ({ kind }) => {

    const text = kind.charAt(0).toUpperCase() + kind.slice(1);

    const { t } = useTranslation(['teams']);

    return (
        <div className="flex items-center">
            <TruckIcon className="size-5 mr-1" />
            <span className="font-semibold capitalize">{t('trailerSize' + text)}</span>
        </div>
    );
};

export default CapacityIcon;