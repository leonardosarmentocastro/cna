> criar usuário
  > digita usuário/senha
  > confirma formulario
    - usuário é criado
    - assino um token pra ele
    - retorno token no header
    * usuário autenticado *

> logar
  > digita usuário/senha
  > confirma formulario
    - query no banco pra ver se existe esse usuário
    > usuário existe
      - senha coincide? 
        - assino um token pra ele
        - retorno token no header
        * usuário autenticado *

> /me
  > decodifico o token
  - uso "subject" do token que refere-se ao "id" para buscar pelo usuário no banco
  - assino um novo token
  - retorno informações mais recentes do usuário no body e o token no header

TODO: NUM FUTURO DISTANTE
> alterar dados do usuário
  > checo a "role" do usuário
    > se usuário é "admin"
      - permitir alterar dados
      - assino um token novo pra ele
      - retorno o usuário alterado no body e o token no header
    > se usuário é "basic"
      - checo se o "id" do usuário que ele tá tentando alterar é o mesmo que o "id" usado no token dele
        > se os "ids" forem iguais
          - permitir alterar dados
          - assino um token pra ele
          - retorno o usuário alterado no body e o token no header
