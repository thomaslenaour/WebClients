import crystal from '../../../public/assets/protonpass-icon.svg';

export const LoadingView = () => (
    <div className="h100 flex flex-align-items-center anime-fade-in">
        <div className="relative w100 text-center">
            <img src={crystal} width={60} height={60} className={'extension-skeleton--logo'} alt="" />
        </div>
    </div>
);
