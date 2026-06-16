import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch, RootState} from './index';

// Tip güvenli redux hook'ları.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
