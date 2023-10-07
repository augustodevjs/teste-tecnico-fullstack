import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Alert, Button, FormProductInputModel, Modal, ModalProps, ValidationError, productFormValidation, productViewModel } from "../../../../shared";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ProductService } from "../../../../shared/services";
import { ClipLoader } from "react-spinners";
import { FaPen } from "react-icons/fa";
import { ProductForm } from "../product-form";
import * as S from './edit-product-modal.styles'

type Props = Pick<ModalProps, 'isOpen' | 'onRequestClose'> & {
  id?: string;
  setData: Dispatch<SetStateAction<productViewModel[]>>;
};

export const EditProductModal: React.FC<Props> = ({
  isOpen,
  onRequestClose,
  setData,
  id,
}) => {
  const form = useForm<FormProductInputModel>({
    mode: 'onChange',
    resolver: yupResolver(productFormValidation),
  });

  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    try {
      if (id) {
        const response = await ProductService.loadById({ id: Number(id) });
        form.reset(response)
      }
    } catch (error) {
      Alert.callError({
        title: (error as Error).name,
        description: (error as Error).message,
      });
    }
  }

  useEffect(() => {
    loadData()
  }, [id]);

  const onSuccess = async (data: FormProductInputModel) => {
    if (id) {
      const response = await ProductService.update({ data, id: Number(id) });

      Alert.callSuccess({
        title: 'Produto atualizado com sucesso!',
        onConfirm: onRequestClose,
      });

      setIsLoading(false);

      setData((prevData) =>
        prevData.map((client) =>
          client.id === response.id ? { ...response } : client,
        ),
      );

      form.reset();
    }
  }

  const onError = (error: unknown) => {
    setIsLoading(false);
    form.reset();

    if (error instanceof ValidationError) {
      Alert.callError({
        title: (error as Error).name,
        description: error.errors[0],
      });
    } else {
      Alert.callError({
        title: (error as Error).name,
        description: (error as Error).message,
      });
    }
  };

  const onSubmit = async (data: FormProductInputModel) => {
    setIsLoading(true);
    try {
      await onSuccess(data)
    } catch (error) {
      onError(error)
    }
  };

  const submitButton = (
    <Button
      type="submit"
      disabled={!form.formState.isValid}
      form="edit-product-form"
      variant="primary"
    >
      {isLoading ? (
        <S.ContainerLoading>
          <ClipLoader color="#fff" loading size={18} speedMultiplier={1} />
        </S.ContainerLoading>
      ) : (
        'Salvar'
      )}
    </Button>
  );

  const modalConfigs: ModalProps = {
    size: 'sm',
    isOpen,
    icon: FaPen,
    onRequestClose,
    title: 'Edição de produto',
    actions: [submitButton],
  };

  return (
    <Modal {...modalConfigs}>
      <FormProvider {...form}>
        <ProductForm id="edit-product-form" onSubmit={onSubmit} />
      </FormProvider>
    </Modal>
  );
};